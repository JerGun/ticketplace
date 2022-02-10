// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Ticket is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    address payable owner;

    struct CreatedItem {
        uint256 tokenId;
        uint256 supply;
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
        uint256 supply;
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

    function mintToken(string memory tokenUri, uint256 supply)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId, supply, "");
        setTokenUri(newItemId, tokenUri);
        createdTokens[msg.sender].push(CreatedItem(newItemId, supply));
        return newItemId;
    }

    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        uint256 supply
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
            supply,
            false
        );

        safeTransferFrom(msg.sender, address(this), tokenId, supply, "");

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

    function fetchItemsCreated(address account)
        public
        view
        returns (CreatedItem[] memory)
    {
        CreatedItem[] memory items = createdTokens[account];
        return items;
    }

    function fetchMarketItem(uint256 tokenId)
        public
        view
        returns (MarketItem memory)
    {
        uint256 itemCount = _itemIds.current();

        MarketItem memory item;
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].tokenId == tokenId) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                item = currentItem;
            }
        }
        return item;
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            MarketItem storage currentItem = idToMarketItem[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return items;
    }

    function inspectSender() public view returns (address) {
        return msg.sender;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
