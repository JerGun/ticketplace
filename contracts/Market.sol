// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Market {
    // public - anyone can call
    // private - only this contract
    // internal - only this contract and inheriting contracts
    // external - only external calls

    enum ListingStatus {
        Active,
        Sold,
        Cancelled
    }

    struct Listing {
        ListingStatus status;
        address seller;
        address token;
        uint tokenId;
        uint price;
    }

    event Listed(
        uint listingId,
        address seller,
        address token,
        uint tokenId,
        uint price
    );

    event Sale(
        uint listingId,
        address buyer,
        address token,
        uint tokenId,
        uint price
    );

    event Cancel(
        uint listingId,
        address seller
    );

    uint private _listingId = 0;
    mapping(uint => Listing) private _listing;

    function listToken(address token, uint tokenId, uint price) external {
        IERC721(token).transferFrom(msg.sender, address(this), tokenId);

        Listing memory listing = Listing(
            ListingStatus.Active,
            msg.sender,
            token,
            tokenId,
            price
        );

        _listingId++;

        _listing[_listingId] = listing;

        emit Listed(_listingId, msg.sender, token, tokenId, price);
    }

    // fuction can read and write
    // view - read only
    // pure - no read, no write

    function getListing(uint listingId) public view returns (Listing memory listing) {
        return _listing[listingId];
    }

    function buyToken(uint listingId) external payable {
        Listing storage listing = _listing[listingId];

        require(msg.sender != listing.seller, "Seller cannot be buyer");
        require(listing.status != ListingStatus.Active, "Listing is not active");

        require(msg.value >= listing.price, "Insufficient payment");

        payable(listing.seller).transfer(listing.price);
        IERC721(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);

        listing.status = ListingStatus.Sold;

        emit Sale(listingId, msg.sender, listing.token, listing.tokenId, listing.price);
    }

    function cancel(uint listingId) public {
        Listing storage listing = _listing[listingId];

        require(msg.sender == listing.seller, "Only seller can cancel listing");
        require(listing.status == ListingStatus.Active, "Listing is not active");

        listing.status = ListingStatus.Cancelled;
        
        IERC721(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);

        emit Cancel(listingId, listing.seller);
    }
}