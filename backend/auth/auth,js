const express = require('express');
const {login} = require('./login');
const register = require('./register');

const authRouter = express.Router();

//the login system will have all the registered doctors and patients that is whose records are there in the database of doctor_details and patient_info
authRouter.route('/login')//login is for registered doctors(doctors can only login)
//wherease login for patients and if they are not registered then registration is only for the patients where they can register

//when loged in the token sent and that token is used while sending request to the server

//do ki for all that needs id na for that better to take it from the verify ka or see that 
//because any id access is being seen(or frontend once log in the id has to be brought from the token and used)
.post(login);

// authRouter.route('/register')
// .post(register);

module.exports = authRouter;