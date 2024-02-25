const express = require('express');
const dotenv = require('dotenv')
const patientRouter = require('./routes/patients');
const doctorRouter = require('./routes/doctors');
const authRouter = require('./auth/auth');

const {verify_doctor} = require('./middleware/verify_doctor');
const {verify_patient} = require('./middleware/verify_patients');

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());//json will parse the body of the request to json

app.use('/auth',authRouter);
//send Authentication in headers as authentication: "Bearer token"
app.use('/patients',verify_patient, patientRouter);//shd add authentication for both
app.use('/doctors',verify_doctor, doctorRouter);


app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});