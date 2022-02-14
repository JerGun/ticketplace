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
        address payable owner;
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
        createdEvents[msg.sender].push(
            EventItem(newItemId, payable(msg.sender))
        );
    }

    function mintTicket(
        string memory tokenUri,
        uint256 eventTokenId,
        uint256 supply
    ) public {
        for (uint256 i = 0; i < supply; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();

            _mint(msg.sender, newItemId, 1, "");
            setTokenUri(newItemId, tokenUri);
            ticketsInEvent[eventTokenId].push(
                TicketItem(newItemId, payable(msg.sender))
            );
        }
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
}
