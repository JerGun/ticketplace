// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Tickets is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    address payable owner;

    struct CreatedItem {
        uint256 tokenId;
        uint256 amount;
    }

    // mapping(address => OwnedItem[]) public ownedTokens;
    mapping(address => CreatedItem[]) public createdTokens;

    constructor() ERC1155("https://ipfs.infura.io") {
        owner = payable(msg.sender);
    }

    // modifier onlyOwner() {
    //     require(owner == msg.sender, "Only Owner!");
    //     _;
    // }

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        uint256 amount;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool list,
        bool sold
    );

    mapping(uint256 => string) private _uris;

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    function setTokenUri(uint256 tokenId, string memory tokenUri) public {
        require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice");
        _uris[tokenId] = tokenUri;
    }

    function mintToken(string memory tokenUri, uint256 amount)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId, amount, "");
        setTokenUri(newItemId, tokenUri);
        createdTokens[msg.sender].push(CreatedItem(newItemId, amount));
        return newItemId;
    }

    function createMarketItem(
        address ticketContract,
        uint256 tokenId,
        uint256 price,
        uint256 amount
    ) public payable {
        require(price > 0, "Price must be at least 1 wei");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            tokenId,
            payable(msg.sender),
            payable(msg.sender),
            price,
            amount,
            false
        );

        IERC1155(ticketContract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            ""
        );

        emit MarketItemCreated(
            itemId,
            tokenId,
            msg.sender,
            msg.sender,
            price,
            true,
            false
        );
    }

    /* Returns only items a user has created */
    function fetchItemsCreated(address account)
        public
        view
        returns (CreatedItem[] memory)
    {
        CreatedItem[] memory items = createdTokens[account];
        return items;
    }

    function inspectSender() public view returns (address) {
        return msg.sender;
    }
}
