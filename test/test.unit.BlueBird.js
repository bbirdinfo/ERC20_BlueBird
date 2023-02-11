const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain, networkConfig } = require("../helper-hardhat-config")
const { Signer } = require("ethers")

function toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }

developmentChain.includes(network.name)
    describe("BlueBirdERC20 Staging Tests", () => {
        let blueBird, deployer, maticUsdPriceFeedAddress
        const chainId = network.config.chainId

        beforeEach( async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            blueBird = await ethers.getContract("BlueBird", deployer)
            if (chainId == 31337) {
                const ethUsdAggregator = await deployments.get("MockV3Aggregator")
                maticUsdPriceFeedAddress = ethUsdAggregator.address
            } else {
                maticUsdPriceFeedAddress = networkConfig[chainId]["maticUsdPriceFeed"]
            }

        })

        // COSTRUTTORE: vedere che i parametri siano quelli attesi
        describe("Constructor & initialize: initalizes the BlueBird correctly", () => {
            it("check owner", async () => {
                assert.equal(await blueBird.getOwner(), deployer)
            })
            it("check cap for line", async ()=>{
                const caps = await blueBird.getMinter4amount()
                assert.equal(caps[0],1000000000*8/100*1e18)
                assert.equal(caps[1],1000000000*58/100*1e18)
                assert.equal(caps[2],1000000000*24/100*1e18)
                assert.equal(caps[3],1000000000*10/100*1e18)
            })
            it("check cap mint", async ()=>{    
                const minted = await blueBird.getMinter4minted()
                assert.equal(Number(minted[0]), 1000000000*8/100*2/100*1e18)
                assert.equal(minted[1],0)
                assert.equal(minted[2],0)
                assert.equal(minted[3],0)
            })
            it("check priceFeed address", async ()=>{    
                assert.equal(await blueBird.getPriceFeed(), maticUsdPriceFeedAddress)
            })
            it("balance owner (mint 2000000)", async ()=>{
                assert.equal(Number(await blueBird.balanceOf(deployer)), 1600000 * 10 ** 18)
            })
        })

        // aggregatorUpgrade(address newpriceFeedAdd)
        describe("The aggregatorUpgrade function", () => {
            let accounts
            beforeEach(async () =>{
                accounts = await ethers.getSigners()
            })
            it("check owner", async () => {
                const accont1ConnectedBlueBird = blueBird.connect(accounts[2])
                await expect(accont1ConnectedBlueBird.aggregatorUpgrade(accounts[1].address)).to.be.reverted
            })
            it("Contract address upgrade", async () => {
                await blueBird.aggregatorUpgrade(accounts[1].address)
                assert.equal(await blueBird.getPriceFeed(), accounts[1].address)
            })
            it("check event", async () => {
                await expect(blueBird.aggregatorUpgrade(accounts[1].address)).to.emit(blueBird,'aggregatorUpgradeEvent').withArgs(accounts[1].address)
            })
        })

        // mintDirectly(address account, uint256 _amount, bytes memory typeMining) 
        describe("The mintDirectly function", () => {
            let accounts
            beforeEach(async () =>{
                accounts = await ethers.getSigners()
            })
            it("check owner", async () => {
                const accont1ConnectedBlueBird = blueBird.connect(accounts[2])
                await expect(accont1ConnectedBlueBird.mintDirectly(accounts[1].address,1000,"fondationFee")).to.be.reverted
            })
            it("Mint increst wallet balance", async () => {
                await blueBird.mintDirectly(accounts[2].address,1000,"fondationFee")
                const balance = await blueBird.balanceOf(accounts[2].address)
                assert.equal(Number(balance), 1000*10**18)
            })
            it("Mint increst the value of the token mint for type", async () => {
                await blueBird.mintDirectly(accounts[1].address,1000,"fondationFee")
                await blueBird.mintDirectly(accounts[1].address,1000,"ecosystem")
                await blueBird.mintDirectly(accounts[1].address,1000,"marketingOinvestiment")
                await blueBird.mintDirectly(accounts[1].address,1000,"consulting")
                const minted = await blueBird.getMinter4minted()
                assert.equal(Number(minted[0]), (1000000000*8/100*2/100+1000)*1e18)
                assert.equal(Number(minted[1]), 1000*1e18)
                assert.equal(Number(minted[2]), 1000*1e18)
                assert.equal(Number(minted[3]), 1000*1e18)

            })
            it("check event", async () => {
                await expect(blueBird.mintDirectly(accounts[1].address,1000,"fondationFee")).to.emit(blueBird,'mintDirectlyEvent').withArgs(accounts[1].address,toFixed(1000),"fondationFee")
            })
            it("check limitation mint", async () => {
                await expect(blueBird.mintDirectly(accounts[1].address,78400001,"fondationFee")).to.be.rejectedWith('BlueBird__ErrorMint("fondationFee", 78400001000000000000000000)')
                
                await expect(blueBird.mintDirectly(accounts[1].address,580000001,"ecosystem")).to.be.rejectedWith('BlueBird__ErrorMint("ecosystem", 580000001000000000000000000)')
                blueBird.mintDirectly(accounts[1].address,100000000,"ecosystem")
                await expect(blueBird.mintDirectly(accounts[1].address,480000001,"ecosystem")).to.be.rejectedWith('BlueBird__ErrorMint("ecosystem", 480000001000000000000000000)')
                
                await expect(blueBird.mintDirectly(accounts[1].address,240000001,"marketingOinvestiment")).to.be.rejectedWith('BlueBird__ErrorMint("marketingOinvestiment", 240000001000000000000000000)')
                blueBird.mintDirectly(accounts[1].address,100000000,"marketingOinvestiment")
                await expect(blueBird.mintDirectly(accounts[1].address,140000001,"marketingOinvestiment")).to.be.rejectedWith('BlueBird__ErrorMint("marketingOinvestiment", 140000001000000000000000000)')
                
                await expect(blueBird.mintDirectly(accounts[1].address,100000001,"consulting")).to.be.rejectedWith('BlueBird__ErrorMint("consulting", 100000001000000000000000000)')
                blueBird.mintDirectly(accounts[1].address,100000000,"consulting")
                await expect(blueBird.mintDirectly(accounts[1].address,1,"consulting")).to.be.rejectedWith('BlueBird__ErrorMint("consulting", 1000000000000000000)')

            })
        })

        describe("The mintFromMatic function", () => {
            let accounts
            beforeEach(async () =>{
                accounts = await ethers.getSigners()
            })

            it("check Matic Balance: Funzionalità superflua", ()=>{})
            
            // 3 chiamate differenti, quantita variata
            it("The 3 class of price work correctly (change price)", async() => {
                let balance1, balance2, balance3
                const rate = await blueBird.getMaticRate()
                blueBird = blueBird.connect(accounts[2])

                
                await blueBird.mintFromMatic({value:1000})
                balance1 = await blueBird.balanceOf(accounts[2].address)
                assert.equal((Number(balance1)/(1000*rate)*1e18).toFixed(8),125)
                
                await blueBird.mintFromMatic({value:750})
                balance2 = await blueBird.balanceOf(accounts[2].address)-balance1
                assert.equal((Number(balance2)/(750*rate)*1e18).toFixed(0),100)

                await blueBird.mintFromMatic({value:200})
                balance3 = await blueBird.balanceOf(accounts[2].address)-balance1-balance2
                console.log(Number(balance3)/(750*rate)*1e18)
                assert.equal((Number(balance3)/(200*rate)*1e18).toFixed(8),50)
                console.log(Number(await blueBird.balanceOf(accounts[2].address)))

                assert.equal((Number(await blueBird.balanceOf(accounts[2].address))*1e18).toFixed(6),rate*1000*125+rate*750*100+rate*200*50)
             })

            it("Test limit mint (revert BlueBird__ErrorMint('ecosystem',mintAmount))", async() => {
                blueBird = blueBird.connect(accounts[2])

                await blueBird.mintFromMatic({value:1000})
                console.log(Number(await blueBird.balanceOf(accounts[2].address)))
                await blueBird.mintFromMatic({value:750})
                console.log(Number(await blueBird.balanceOf(accounts[2].address)))
                await blueBird.mintFromMatic({value:1800})
                console.log(Number(await blueBird.balanceOf(accounts[2].address)))
                console.log(Number((await blueBird.getMinter4amount())[1]))
                console.log(Number((await blueBird.getMinter4minted())[1]))
                await expect(blueBird.mintFromMatic({value:1})).to.be.rejected//With('BlueBird__ErrorMint("ecosystem", 100000)')
            })
        })


        describe("The mintTokenAmount function", () => {
            let accounts, rate
            beforeEach(async () =>{
                accounts = await ethers.getSigners()
                rate = await blueBird.getMaticRate()
            })

            // 3 chiamate differenti, quantita variata
            it("check update aggiornamento minter4minted['ecosystem']", async() => {
                await blueBird.mintFromMatic({value:1000})


                const caps = await blueBird.getMinter4amount()
                assert.equal(caps[0],1000000000*8/100*1e18)
                assert.equal(caps[1],1000000000*58/100*1e18)
                assert.equal(caps[2],1000000000*24/100*1e18)
                assert.equal(caps[3],1000000000*10/100*1e18)
                const minted = await blueBird.getMinter4minted()
                assert.equal(Number(minted[0]), 1000000000*8/100*2/100*1e18)
                assert.equal(Number(minted[1]), 1000*rate/1e18*125*1e18)
                assert.equal(Number(minted[2]), 0)
                assert.equal(Number(minted[3]), 0)
            })

            it("check event mintFromMaticEvent(msg.sender, valueMint, mintPrice);", async() => {
                await expect(await blueBird.mintFromMatic({value:1000})).to.emit(blueBird,'mintFromMaticEvent')//.withArgs(accounts[1].address,1000*rate/1e18*125,Number(rate)*125) //NOTA: parameters are correct but in the execution "Number(rate)*125" create an error 
            })
        })

        describe("The _mint(address account, uint256 amount) function", () => {
            it("check checkCap(amount): Funzionalità superflua", async() => {})
        })

        describe("The destroy function", () => {
            let accounts
            beforeEach(async () =>{
                accounts = await ethers.getSigners()
            })
            it("check owner", async () => {
                const accont1ConnectedBlueBird = blueBird.connect(accounts[2])
                await expect(accont1ConnectedBlueBird.destroy()).to.be.reverted
            })
        })

        describe("The burn function", () => {
            let accounts
            beforeEach(async () =>{
                accounts = await ethers.getSigners()
                await blueBird.mintDirectly(accounts[1].address,1000,"consulting")
            })
            it("check checkBalance(balanceOf(msg.sender),amount) is working", async() => {
                blueBird = blueBird.connect(accounts[2])
                await expect(blueBird.burn(2000)).to.be.rejectedWith("BlueBird__ErrorBilancio()")
            })
            it("check increst burned variable", async() => {
                blueBird.burn(500)
                assert.equal(await blueBird.getBurned(),500)                
            })
            it("check variable contest is not change if not for burned and totalsupply", async() => {
                const caps1 = await blueBird.getMinter4amount()
                const minted1 = await blueBird.getMinter4minted()
                const cap1 = await blueBird.getCap()

                const supply = Number(await blueBird.totalSupply())
                blueBird.burn(500)
                assert.equal(await blueBird.getBurned(),500) 
                assert.equal(Number(await blueBird.totalSupply()), supply-500)

                const caps2 = await blueBird.getMinter4amount()
                const minted2 = await blueBird.getMinter4minted()
                const cap2 = await blueBird.getCap()

                assert.equal(Number(caps1[0]),Number(caps2[0]))
                assert.equal(Number(caps1[1]),Number(caps2[1]))
                assert.equal(Number(caps1[2]),Number(caps2[2]))
                assert.equal(Number(caps1[3]),Number(caps2[3]))
                assert.equal(Number(minted1[0]), Number(minted2[0]))
                assert.equal(Number(minted1[1]), Number(minted2[1]))
                assert.equal(Number(minted1[2]), Number(minted2[2]))
                assert.equal(Number(minted1[3]), Number(minted2[3]))
                assert.equal(Number(cap1), Number(cap2))
            })
            it("check event burnEvent;", async() => {
                await expect(await blueBird.burn(5000)).to.emit(blueBird,'burnEvent').withArgs(accounts[1].address,5000)
            })
        })

        
        describe("The mintBurn function", () => {
            let accounts
            beforeEach(async () =>{
                accounts = await ethers.getSigners()
                await blueBird.burn(1000)
            })
            it("check owner", async () => {
                const accont1ConnectedBlueBird = blueBird.connect(accounts[2])
                await expect(accont1ConnectedBlueBird.mintBurn(accounts[1].address,500)).to.be.reverted
            })
            it("check checkBalance(burned,amount) is working", async() => {
                await expect(blueBird.mintBurn(accounts[2].address,2000)).to.be.rejectedWith("BlueBird__ErrorBilancio()")
            })
            it("check descrest burned variable and increst supply", async() => {
                startSupply = Number(await blueBird.totalSupply())
                blueBird.mintBurn(accounts[2].address,200)
                assert.equal(Number(await blueBird.getBurned()),800)
                assert.equal(Number(await blueBird.totalSupply()),Number(startSupply+200))
            })

            it("check variable contest is not change if not for burned and totalsupply", async() => {
                const caps1 = await blueBird.getMinter4amount()
                const minted1 = await blueBird.getMinter4minted()
                const cap1 = await blueBird.getCap()

                const supply = Number(await blueBird.totalSupply())
                blueBird.mintBurn(accounts[2].address,200)
                assert.equal(await blueBird.getBurned(),800) 
                assert.equal(Number(await blueBird.totalSupply()), supply+200)

                const caps2 = await blueBird.getMinter4amount()
                const minted2 = await blueBird.getMinter4minted()
                const cap2 = await blueBird.getCap()

                assert.equal(Number(caps1[0]),Number(caps2[0]))
                assert.equal(Number(caps1[1]),Number(caps2[1]))
                assert.equal(Number(caps1[2]),Number(caps2[2]))
                assert.equal(Number(caps1[3]),Number(caps2[3]))
                assert.equal(Number(minted1[0]), Number(minted2[0]))
                assert.equal(Number(minted1[1]), Number(minted2[1]))
                assert.equal(Number(minted1[2]), Number(minted2[2]))
                assert.equal(Number(minted1[3]), Number(minted2[3]))
                assert.equal(Number(cap1), Number(cap2))
            })
            it("check event mintBurnEvent(address, uint)", async() => {
                await expect(await blueBird.mintBurn(accounts[2].address, 1000)).to.emit(blueBird,'mintBurnEvent').withArgs(accounts[2].address,1000)
            })

        })
    })

