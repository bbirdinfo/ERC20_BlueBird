const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying contract ...")
    try{
        // non funziona
        let a = await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log("Verifyed contract ...")
    } catch (err){
        if(err.message.toLowerCase().includes("already verified")){
            console.log("Already Verified!")
        } else {
            console.log(err)
        }
    }
}

module.exports = {
    verify,
}