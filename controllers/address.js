const { validateAddress } = require("../models/address");
const { Address } = require("../models/address");

async function addAddress(req, res) {
    
    const user = req.user;
    //console.log(req.user._id)
    const {error} = validateAddress(req.body);
    if(error) {
        return res.status(400).send({message:`Bad Request ${error}`});
    }

    try {
        const address = new Address({...req.body, user: user._id});
        const savedAddress = await address.save();
        return res.send({...savedAddress});
    } catch(error) {
        return res.status(400).send({message:error.message});
    }
}

async function getAddresses(req, res) {
    const user = req.user;

    try {
        const addresses = await Address.find({user: user._id});
        return res.send(addresses);
    } catch(error) {
        return res.status(400).send({message:error.message});
    }
}

module.exports = {
    addAddress,
    getAddresses
}