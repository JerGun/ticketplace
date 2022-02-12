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

    constructor() ERC1155("https://ipfs.infura.io") {
        owner = payable(msg.sender);
    }

    // modifier onlyOwner() {
    //     require(owner == msg.sender, "Only Owner!");
    //     _;
    // }

    // struct OwnedItem {
    //     uint256 tokenId;
    //     uint256 supply;
    // }

    // struct CreatedItem {
    //     uint256 tokenId;
    //     uint256 supply;
    // }

    struct Item {
        uint256 tokenId;
        uint256 supply;
        uint256 quantity;
        address payable[] owner;
        address minter;
    }

    // struct ListedItem {
    //     uint256 tokenId;
    //     uint256 supply;
    //     uint256 quantity;
    //     address payable[] owner;
    //     address minter;
    //     uint256 price;
    // }

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address payable[] owner;
        uint256 price;
        uint256 supply;
        uint256 quantity;
        bool sold;
    }

    mapping(uint256 => Item) private token;
    mapping(address => Item[]) public ownedTokens;
    mapping(address => Item[]) public createdTokens;
    // mapping(address => ListedItem[]) public listedTokens;

    mapping(uint256 => MarketItem) private idToMarketItem;

    mapping(uint256 => string) private _uris;

    event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address payable[] owner,
        uint256 price,
        uint256 supply,
        uint256 quantity,
        bool sold
    );

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
        address payable[] memory newOwner = new address payable[](1);
        newOwner[0] = payable(msg.sender);
        token[newItemId] = Item(
            newItemId,
            supply,
            supply,
            newOwner,
            msg.sender
        );
        createdTokens[msg.sender].push(
            Item(newItemId, supply, supply, newOwner, msg.sender)
        );
        return newItemId;
    }

    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        uint256 quantity
    ) public payable {
        require(token[tokenId].quantity > 0, "Run out of Token");
        require(
            quantity <= token[tokenId].quantity,
            "Quantity must less than or equal Token available"
        );
        require(price > 0, "Price must be at least 1 wei");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        uint256 available = token[tokenId].supply - quantity;
        token[tokenId].quantity = available;

        // address payable[] memory newOwner = token[tokenId].owner;
        // newOwner[token[tokenId].owner.length] = payable(msg.sender);

        idToMarketItem[itemId] = MarketItem(
            itemId,
            tokenId,
            payable(msg.sender),
            token[tokenId].owner,
            price,
            token[tokenId].supply,
            quantity,
            false
        );

        safeTransferFrom(msg.sender, address(this), tokenId, quantity, "");

        emit MarketItemCreated(
            itemId,
            tokenId,
            msg.sender,
            token[tokenId].owner,
            price,
            token[tokenId].supply,
            quantity,
            true
        );
    }

    function fetchItem(uint256 tokenId) public view returns (Item memory) {
        Item memory item = token[tokenId];
        return item;
    }

    function fetchCreatedItems(address account)
        public
        view
        returns (Item[] memory)
    {
        Item[] memory items = createdTokens[account];
        return items;
    }

    function fetchOwnedItems(address account)
        public
        view
        returns (Item[] memory)
    {
        Item[] memory items = ownedTokens[account];
        return items;
    }

    function fetchListedItems(address account)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].seller == account) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMarketItem(uint256 tokenId)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].tokenId == tokenId) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].tokenId == tokenId) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
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
