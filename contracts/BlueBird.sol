// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title BLUE BIRD ERC20
 * @author Samuele Chiesa
 * @notice The contract is write for Marco Liu, creator of BlueBird project. This code had the scope to create a new token ERC20
 * @dev The contract is upgradeable and uses openzeppeling lib
 */
contract BlueBird is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable {
    /*--- COSTANTS ---*/
    address payable private immutable owner;
    uint private immutable cap = 1000000000;

    /*--- VARIABLES ---*/
    uint public burned = 0;
    mapping (string=>uint256) public minter4amount;
    mapping (string=>uint256) public minter4minted;
    uint8[3] private miningPrice = [125,100,50];
    AggregatorV3Interface internal priceFeed;

    /*--- MODIFIER ---*/
    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    modifier checkMint(string memory typeMining, uint _amount){
        if(minter4minted[typeMining]+_amount > minter4amount[typeMining])
            revert BlueBird__ErrorMint(typeMining, _amount);
        _;
    }
    modifier checkCap(uint amount){
        if((ERC20Upgradeable.totalSupply()/10**decimals()) + amount > getCap()){
            revert BlueBird__ErrorERC20Capped();
        }
        _;
    }
    modifier checkBalance(uint bilancio,uint amount){
        if(bilancio<amount){
            revert BlueBird__ErrorBilancio();
        }
        _;
    }

    /*--- ERROR ---*/
    error BlueBird__ErrorMint(string, uint);
    error BlueBird__ErrorERC20Capped();
    error BlueBird__ErrorCall();
    error BlueBird__ErrorBilancio();

    /*--- EVENTS ---*/
    event aggregatorUpgradeEvent(address);
    event mintFromMaticEvent(address, uint, uint);
    event mintDirectlyEvent(address, uint, string);
    event burnEvent(address, uint);
    event mintBurnEvent(address, uint);

    /*--- CONSTRUCTOR ---*/
    /**
     * @dev In the constructor are define the mint cap for each entites and the mint state
     * @param priceFeedAdd Address AggregatorV3Interface
     */ 
    constructor(address priceFeedAdd){
        owner = payable(msg.sender);
        minter4amount["fondationFee"] = cap*8/100;
        minter4amount["ecosystem"] = cap*58/100;
        minter4amount["marketingOinvestiment"] = cap*24/100;
        minter4amount["consulting"] = cap*10/100;

        minter4minted["fondationFee"] = cap*8/100*2/100;
        minter4minted["ecosystem"] = 0;
        minter4minted["marketingOinvestiment"] = 0;
        minter4minted["consulting"] = 0;

        priceFeed = AggregatorV3Interface(priceFeedAdd);
        _mint(owner, cap*8/100*2/100);
    }

    /*--- FUNCTION ---*/

    // INTIALIZE
    /**
     * @dev This function is used to make the contract upgradeable
     */ 
    function initialize() external initializer {
        __ERC20_init("BlueBird", "BBD");
        __ERC20Burnable_init();
    }

    // AGGREGATOR UPGRADE
    /**
     * @notice AggregatorV3Interface upgrade allows to upgrade the contract from which we take the Matic/USD exchange rate  
     * @dev AggregatorV3Interface is the base of the mint from Matic
     * @param newpriceFeedAdd New address AggregatorV3Interface
     */ 
    function aggregatorUpgrade(address newpriceFeedAdd) public onlyOwner {
        priceFeed = AggregatorV3Interface(newpriceFeedAdd);
        emit aggregatorUpgradeEvent(newpriceFeedAdd);
    }

    // MINT FUNCTION
    /**
     * @notice mintDirectly allows the contract owner to distribute the tokens directly to any investors and all other entities. 
     * @dev Only the owner can call this function and the state of mint will upgrade
     * @param account The account will recieve the money
     * @param _amount The number of token will sent to the account
     * @param typeMining In base of the type choose between: fondationFee, ecosystem, marketingOinvestiment and developing
     */ 
    function mintDirectly(address account, uint256 _amount, string memory typeMining) public onlyOwner checkMint(typeMining,_amount) {
        minter4minted[typeMining] = minter4minted[typeMining]+_amount;
        _mint(account,_amount);
        emit mintDirectlyEvent(account, _amount, typeMining);
    }

    /**
     * @notice The function allows to mint tokens by sending Matic
     * @dev Based on the number of matic and mint level, the number of tokens to be sent is defined
     */ 
    // NB: il prezzo di mint dipende dal prezzo a cui si è arrivati nel momento del mint, 
    //      se un acquisto dovesse andare a cavallo su due 2 fasce di prezzo viene presa quella inferiore
    function mintFromMatic() external payable checkBalance(address(msg.sender).balance,msg.value){
        uint mintPrice;
        if(minter4minted["ecosystem"]<getCap()*25/100){
            mintPrice = mintTokenAmount(0);
        } else if (minter4minted["ecosystem"]<getCap()*15/100+getCap()*25/100){
            mintPrice = mintTokenAmount(1);
        } else {
            mintPrice = mintTokenAmount(2);
        }
        (bool callSuccess,) = owner.call{value: msg.value}('');
        if(!callSuccess){
            revert BlueBird__ErrorCall();
        }
        uint valueMint = msg.value*mintPrice/1e18;
        minter4minted["ecosystem"] = minter4minted["ecosystem"]+valueMint;
        _mint(msg.sender, valueMint);
        emit mintFromMaticEvent(msg.sender, valueMint, mintPrice);
    }

    /**
     * @dev Private function uses for define amount of token from an amount of matic
     */ 
    function mintTokenAmount(uint8 n) private view returns(uint){
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        uint maticUsd = uint256(answer * 10000000000);
        uint price = miningPrice[n];
        uint mintPrice = maticUsd*price;
        if(minter4minted["ecosystem"]*1e18+ mintPrice > minter4amount["ecosystem"]*1e18){
            revert BlueBird__ErrorMint("ecosystem",mintPrice/1e18);
        }
        return mintPrice;
    }

    /**
     * @dev Override of ERC20Upgradeable
     */ 
    function _mint(address account, uint256 amount) internal virtual override(ERC20Upgradeable) checkCap(amount) {
        super._mint(account, amount * (10 ** decimals()));
    }

    // DESTROY FUNCTION
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    //BURN FUNCTION
    /**
     * @notice The function allows to burn tokens
     * @param amount The number of token will burn
     */ 
    function burn(uint256 amount) public override(ERC20BurnableUpgradeable) checkBalance(balanceOf(msg.sender),amount){
        burned = burned+amount;
        _burn(msg.sender, amount * (10 ** decimals()));
        emit burnEvent(msg.sender, amount);
    }

    /**
     * @notice The function allows previously burned tokens to be mint
     * @param account The account will recieve the money
     * @param amount The number of token will sent to the account
     */ 
    function mintBurn(address account,uint256 amount) public onlyOwner checkBalance(burned,amount){
        burned = burned-amount;
        _mint(account, amount);
        emit mintBurnEvent(account, amount);
    }

    // GET FUNCTION
    /**
     * @return return the maximum capilazation
     */ 
    function getCap() public pure returns (uint256) {
        return cap;
    }

    /**
     * @return return the owner of the contract
     */ 
    function getOwner() public view returns (address) {
        return owner;
    }

    /**
     * @return return the owner of the contract
     */ 
    function getBurned() public view returns (uint) {
        return burned;
    }

    /**
     * @dev The function are create for the test
     */ 
    function getMinter4amount() public view returns(uint, uint, uint, uint){
        return (
            minter4amount["fondationFee"],
            minter4amount["ecosystem"],
            minter4amount["marketingOinvestiment"],
            minter4amount["consulting"]
        );
    }

    /**
     * @dev The function are create for the test
     */ 
    function getMinter4minted() public view returns(uint, uint, uint, uint){
        return (
            minter4minted["fondationFee"],
            minter4minted["ecosystem"],
            minter4minted["marketingOinvestiment"],
            minter4minted["consulting"]
        );
    }

    /**
     * @dev The function are create for the test
     */ 
    function getMaticRate() public view returns(uint result){
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        result = uint256(answer * 10000000000);
    }

    
    /**
     * @dev The function are create for the test
     */ 
    function getPriceFeed() public view returns(AggregatorV3Interface){
        return priceFeed;
    }
}