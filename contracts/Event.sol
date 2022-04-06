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

    constructor() ERC1155("Ticketplace") {
        owner = payable(msg.sender);
    }

    mapping(uint256 => string) private _uris;

    struct Item {
        uint256 tokenId;
    }

    struct EventItem {
        uint256 tokenId;
        address payable owner;
    }

    struct TicketItem {
        uint256 tokenId;
        uint256 eventTokenId;
        address payable owner;
        uint256 price;
        bool list;
        bool active;
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
    mapping(uint256 => Item[]) private ticketsInEvent;
    mapping(uint256 => MarketItem) private ticketInMarket;

    mapping(address => EventItem[]) private createdEvents;

    event CreateMarketItem(address sender, uint256 tokenId, uint256 price);

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
                price,
                false,
                true
            );
            ticketsInEvent[eventTokenId].push(Item(newItemId));
            createMarketItem(newItemId, price);
        }
    }

    function createMarketItem(uint256 tokenId, uint256 price) public payable {
        require(
            msg.sender == ticketToken[tokenId].owner,
            "Only for the owner of this ticket!"
        );
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

        ticketToken[tokenId].price = price;
        ticketToken[tokenId].list = true;

        safeTransferFrom(msg.sender, address(this), tokenId, 1, "");

        emit CreateMarketItem(msg.sender, tokenId, price);
    }

    function cancelListing(uint256 itemId) public payable {
        require(
            msg.sender == ticketInMarket[itemId].owner,
            "Only for the owner of this ticket!"
        );
        uint256 tokenId = ticketInMarket[itemId].tokenId;
        ticketToken[tokenId].price = 0;
        ticketToken[tokenId].list = false;
        delete ticketInMarket[itemId];
        _safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
    }

    function buyMarketItem(uint256 itemId) public payable {
        uint256 price = ticketInMarket[itemId].price;
        uint256 tokenId = ticketInMarket[itemId].tokenId;
        require(
            msg.value == price * (10**10),
            "msg.value != price ** decimals"
        );

        ticketInMarket[itemId].seller.transfer(msg.value);
        ticketInMarket[itemId].owner = payable(msg.sender);
        ticketInMarket[itemId].sold = true;
        ticketToken[tokenId].owner = payable(msg.sender);
        ticketToken[tokenId].list = false;
        _itemsSold.increment();

        _safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
    }

    function fetchMarketItem(uint256 tokenId)
        public
        view
        returns (MarketItem memory)
    {
        uint256 itemCount = _itemIds.current();
        MarketItem memory item;

        for (uint256 i = 0; i < itemCount; i++) {
            if (ticketInMarket[i + 1].tokenId == tokenId) {
                uint256 currentId = i + 1;
                item = ticketInMarket[currentId];
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
            if (!ticketInMarket[i + 1].sold) {
                MarketItem storage currentItem = ticketInMarket[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchOwnedListings(address account)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 itemCount = _itemIds.current();
        uint256 tokenCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (ticketInMarket[i + 1].seller == account) {
                tokenCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](tokenCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (ticketInMarket[i + 1].seller == account) {
                MarketItem storage currentItem = ticketInMarket[i + 1];
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

    function fetchCreatedTickets(address account)
        public
        view
        returns (Item[] memory)
    {
        uint256 tokenCount = 0;
        uint256 currentIndex = 0;

        EventItem[] memory events = createdEvents[account];
        for (uint256 i = 0; i < events.length; i++) {
            uint256 ticketCount = ticketsInEvent[events[i].tokenId].length;
            tokenCount += ticketCount;
        }

        Item[] memory items = new Item[](tokenCount);
        for (uint256 i = 0; i < events.length; i++) {
            Item[] storage currentItem = ticketsInEvent[events[i].tokenId];
            for (uint256 j = 0; j < currentItem.length; j++) {
                items[currentIndex] = currentItem[j];
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchOwnedTickets(
        address account,
        bool isAllOwned,
        bool isCreator
    ) public view returns (TicketItem[] memory) {
        uint256 totalTokenCount = _tokenIds.current();
        uint256 tokenCount = 0;
        uint256 currentIndex = 0;

        if (isAllOwned) {
            for (uint256 i = 0; i < totalTokenCount; i++) {
                if (ticketToken[i + 1].owner == account) {
                    tokenCount += 1;
                }
            }
        } else {
            if (isCreator) {
                for (uint256 i = 0; i < totalTokenCount; i++) {
                    if (
                        eventToken[ticketToken[i + 1].eventTokenId].owner ==
                        account &&
                        ticketToken[i + 1].owner == account
                    ) {
                        tokenCount += 1;
                    }
                }
            } else {
                for (uint256 i = 0; i < totalTokenCount; i++) {
                    if (
                        eventToken[ticketToken[i + 1].eventTokenId].owner !=
                        account &&
                        ticketToken[i + 1].owner == account
                    ) {
                        tokenCount += 1;
                    }
                }
            }
        }

        TicketItem[] memory items = new TicketItem[](tokenCount);
        if (isAllOwned) {
            for (uint256 i = 0; i < totalTokenCount; i++) {
                if (ticketToken[i + 1].owner == account) {
                    TicketItem storage currentItem = ticketToken[i + 1];
                    items[currentIndex] = currentItem;
                    currentIndex += 1;
                }
            }
        } else {
            if (isCreator) {
                for (uint256 i = 0; i < totalTokenCount; i++) {
                    if (
                        eventToken[ticketToken[i + 1].eventTokenId].owner ==
                        account &&
                        ticketToken[i + 1].owner == account
                    ) {
                        TicketItem storage currentItem = ticketToken[i + 1];
                        items[currentIndex] = currentItem;
                        currentIndex += 1;
                    }
                }
            } else {
                for (uint256 i = 0; i < totalTokenCount; i++) {
                    if (
                        eventToken[ticketToken[i + 1].eventTokenId].owner !=
                        account &&
                        ticketToken[i + 1].owner == account
                    ) {
                        TicketItem storage currentItem = ticketToken[i + 1];
                        items[currentIndex] = currentItem;
                        currentIndex += 1;
                    }
                }
            }
        }

        return items;
    }

    function fetchTicketsInEvent(uint256 eventTokenId)
        public
        view
        returns (Item[] memory)
    {
        Item[] memory items = ticketsInEvent[eventTokenId];
        return items;
    }

    function fetchEvents() public view returns (EventItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 tokenCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (eventToken[i + 1].tokenId != 0) {
                tokenCount += 1;
            }
        }

        EventItem[] memory items = new EventItem[](tokenCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (eventToken[i + 1].tokenId != 0) {
                EventItem storage currentItem = eventToken[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
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

    function fetchTickets() public view returns (TicketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 tokenCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (ticketToken[i + 1].tokenId != 0) {
                tokenCount += 1;
            }
        }

        TicketItem[] memory items = new TicketItem[](tokenCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (ticketToken[i + 1].tokenId != 0) {
                TicketItem storage currentItem = ticketToken[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
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
