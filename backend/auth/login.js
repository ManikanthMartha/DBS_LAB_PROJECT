const db = require('../db/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
//add email(as unique it is more secure),password,role,id(doct_id or the patient_id based on the role)
async function login(req,res){
    try{
        const{email,password,role}=req.body;
        //if no username,password,role
        console.log(email,password,role);
        if(!email || !password || !role ){
            res.status(400).send({message:"All fields are required"});
            return;
        }
        //seeing for role of each user
        if(role==='doctor'){
            const user = await db.docusers(email);
            console.log(user);
            if(!user){
                res.status(401).send({message:"Invalid Email Address(User doesnt Exist)"});
                return;
            }
            //checking password
            const pass = await db.docpassword(email);//add to see that hashing of password and all retrive hashed pass and checking 
            console.log(pass);
            //check if same password
            if(pass === password){
                //if he is a doctor that doctor ka id also send for token
                const doctor_id = await db.doctor_id(email);//since email is unique and his record is stored in the doctors access the id from there
                res.status(200).send({message:"Login Successful",token:create_jwt(doctor_id,role)});//if id is
                return ;
            }
            else{
                res.status(401).send({message:"Invalid Password"});
            }
        }
        
        else if(role === "patient"){
            const user = await db.patusers(email);
            console.log(user);
            if(!user){
                res.status(401).send({message:"Invalid Email Address(User doesnt Exist)"});
                return;
            }
            //checking password
            const pass = await db.patpassword(email);//add to see that hashing of password and all retrive hashed pass and checking 
            console.log(pass);
            //check if same password
            if(pass === password){
                //if he is a patient that patient ka id also send for token
                const patient_id = await db.patient_id(email);//since email is unique and his record is stored in the patient_info access the id from there

                res.status(200).send({message:"Login Successful",token:create_jwt(patient_id,role)});//if id is
                return ;
            }
            else{
                res.status(401).send({message:"Invalid Password"});
            }
        }
    }catch(err){
        console.log(err);
    }
}

function create_jwt(id,role){//will add the role and id in the token
    return jwt.sign({id,role},process.env.JWT_SECRET_KEY);
}


module.exports = {login};