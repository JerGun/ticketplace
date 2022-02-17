// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Event is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    address payable owner;

    constructor() ERC1155("") {
        owner = payable(msg.sender);
    }

    mapping(uint256 => string) private _uris;

    struct EventItem {
        uint256 tokenId;
        address payable owner;
    }

    struct TicketItem {
        uint256 tokenId;
        uint256 eventTokenId;
        address payable owner;
        uint256 price;
    }

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => EventItem) private eventToken;
    mapping(uint256 => TicketItem) private ticketToken;
    mapping(uint256 => TicketItem[]) private ticketsInEvent;
    mapping(uint256 => MarketItem) private ticketInMarket;

    mapping(address => EventItem[]) private createdEvents;

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    function setTokenUri(uint256 tokenId, string memory tokenUri) public {
        // require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice");
        _uris[tokenId] = tokenUri;
    }

    function mintEvent(string memory tokenUri) public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId, 1, "");
        setTokenUri(newItemId, tokenUri);
        eventToken[newItemId] = EventItem(newItemId, payable(msg.sender));
        createdEvents[msg.sender].push(eventToken[newItemId]);
    }

    function mintTicket(
        string memory tokenUri,
        uint256 eventTokenId,
        uint256 quantity,
        uint256 price
    ) public {
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();

            _mint(msg.sender, newItemId, 1, "");
            setTokenUri(newItemId, tokenUri);
            ticketToken[newItemId] = TicketItem(
                newItemId,
                eventTokenId,
                payable(msg.sender),
                price
            );
            ticketsInEvent[eventTokenId].push(ticketToken[newItemId]);
            createMarketItem(newItemId, price);
        }
    }

    function createMarketItem(uint256 tokenId, uint256 price) public payable {
        require(price > 0, "Price must be at least 1 wei");
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        ticketInMarket[itemId] = MarketItem(
            itemId,
            tokenId,
            payable(msg.sender),
            payable(msg.sender),
            price,
            false
        );

        safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (!ticketInMarket[i + 1].sold) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = ticketInMarket[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchCreatedEvents(address account)
        public
        view
        returns (EventItem[] memory)
    {
        EventItem[] memory items = createdEvents[account];
        return items;
    }

    function fetchTicketsInEvent(uint256 eventTokenId)
        public
        view
        returns (TicketItem[] memory)
    {
        TicketItem[] memory items = ticketsInEvent[eventTokenId];
        return items;
    }

    function fetchEvent(uint256 tokenId)
        public
        view
        returns (EventItem memory)
    {
        EventItem memory item = eventToken[tokenId];
        return item;
    }

    function fetchTicket(uint256 tokenId)
        public
        view
        returns (TicketItem memory)
    {
        TicketItem memory item = ticketToken[tokenId];
        return item;
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