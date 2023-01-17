//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    /**
     * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatentaion of the `baseURI` and the `tokenId`.
     */

    string _baseTokenURI;

    // _price is the price of one crypto Dev NFT
    uint256 public _price = 0.01 ether;

    //_paused is used to pause the contract in case of an emergency
    bool public _paused;

    //max num of cryptoDevs
    uint256 public maxTokenIds = 20;

    //total num of tokenIds minted
    uint256 public tokenIds;

    //whitelist contract instance
    IWhitelist whitelist;

    //boolean to keep track of whether presale started or not
    bool public presaleStarted;

    //timestamp for when presale would end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused() {
        require(!_paused, "Cpntract currently paused");
        _;
    }

    /**
     * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection
     * name in our case is `Cryoto Devs` and symbol is `CD`
     * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection
     * it also initializes an instance of whitelist interface
     */
    constructor(
        string memory baseURI,
        address whitelistContract
    ) ERC721("Crypto Devs", "CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    /**
     * @dev startPresale starts a presale for the whitelisted addresses
     */
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // ..set presaleEnded time as current timestamp + 5 minutes
        // timestamp syntax (secs, mins, hrs, days, years)
        presaleEnded = block.timestamp + 5 minutes;
    }

    /**
     * @dev presaleMint allows a user to mint one NFT per txn during presale
     */
    function presaleMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "presale is not running"
        );
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "Your are not whitelisted"
        );
        require(tokenIds < maxTokenIds, "Exceeds maximum Crypto Devs sypply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        //_safeMint is a safer version of the _mint function as it ensures
        // that if the address being minted to is contract, then it knows how to deal with ERC721 tokens
        //If the address being minted to is not a contract, it works same as
        _safeMint(msg.sender, tokenIds);
    }

    /**
     * @dev mint allows a user to mint 1 nft per txn after the presale is ended
     */
    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet"
        );
        require(tokenIds < maxTokenIds, "Exceeds max Crypto Devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    /**
     * @dev _baseURI overides the Openzeplines ERC721 implementation which by defalut
     * returned an empty string for baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev setPaused makes the contract paused or unpaused
     */

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    /**
     * @dev withdraw sends all the ether in the contract
     * to the owner of the contract
     */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    //fun to receive Ether msg.data must be empty
    receive() external payable {}

    //fallback fun is called when msg.data is not empty
    fallback() external payable{}
}
