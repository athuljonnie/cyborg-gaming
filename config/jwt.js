const jwt = require('jsonwebtoken');
const secretKey ="helloworld";
const generateToken =(id) => {
    return jwt.sign({id},secretKey,{expiresIn :"3d"});
}

module.exports ={ generateToken };