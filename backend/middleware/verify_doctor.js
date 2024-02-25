const jwt = require('jsonwebtoken');

require('dotenv').config();

//send Authentication in headers as authentication: "Bearer token"

//to see if the doctor is accessing and is authorized
function verify_doctor(req, res, next) {
    console.log(req.headers);
    console.log(req.headers['authorization']);//small a in authorization
    console.log(req.Auth);
    if(!req.headers['authorization']){//if no authorization header only then not authorized
        return res.status(401).send({
            auth: false,
            message: 'Unauthorized aato access the page'
        });
    }
    const authorization = req.headers['authorization'];//token in header stored
    console.log(authorization);
    const token = authorization.split(' ')[1];
    console.log(token);
    if (!token) {//if no token 
        return res.status(401).send({
            auth: false,
            message: 'Unauthorized to access the page'
        });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
        //if token is false
        if (err) {
            return res.status(401).send({
                auth: false,
                message: 'Unauthorized to access the page'
            });
        }
        console.log(decoded);
        //no error check if his role is doctor
        // Check if the decoded token role is doctor
        if (decoded.role !== 'doctor') {
            //if not 
            return res.status(401).send({
                auth: false,
                message: 'Unauthorized to access the page'
            });
        }
        else{
            req.Doctor_ID = decoded.id;
            req.role = decoded.role;
            next();
        }
    });
}

module.exports = {verify_doctor};