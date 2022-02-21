const jwt = require('jsonwebtoken');
const { AUTH_TOKEN } = require('../constants');
const config = require("config");

function auth(req, res, next) {

    const token = req.header(AUTH_TOKEN);

    if(!token) {
        //401 Unauthorized
        return res.status(401).send({message:'Please Login first to access this endpoint!'});
    }

    try {
        const decodedToken = jwt.verify(token,config.get("jwt-token"));
        req.user = decodedToken;
        next();
    } catch(error) {
        res.status(401).send({message:'Unauthorized User'});
    }
}

module.exports = auth;