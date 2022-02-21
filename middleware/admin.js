const jwt = require('jsonwebtoken');
const config = require('config');

function admin(req, res, next) {
    const token = req.header('x-auth-token');
    const isAdmin = req.header('isAdmin');
    //console.log(token);

    if(!token) {
        //401 Unauthorized
        return res.status(401).send({message:'Token not provided'});
    }

    try {
        const decodedToken = jwt.verify(token, config.get("jwt-token"));

        if(decodedToken.isAdmin) {
            req.user = decodedToken;
           //console.log(decodedToken);
            next();
        } else {
            //403 Forbidden
            return res.status(403).send({message:'This is restricted to admins'});
        }
        
    } catch(error) {
        res.status(400).send({message:'Bad Request'});
    }
}

module.exports = admin;