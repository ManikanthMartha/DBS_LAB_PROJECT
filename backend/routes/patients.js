const express = require('express');
const { getpatientData, addpatientData, dashboardSend, availableDoctors,appointmentSlots,bookAppointment} = require('../db/db');

const patientRouter = express.Router();

patientRouter.route('/:id')//when at patients/id 
.get(getpatientData)
.post(addpatientData);//when the new patient ka data is posted
    
patientRouter.route('/dashboard/:id')//route for patient dashboard 
.get(dashboardSend);//sending upcoming appointments,prescriptions,tests

patientRouter.route('/:id/appointments/').get(availableDoctors);//appointments se doctors send

patientRouter.route('/:id1/appointments/:id2')
.get(appointmentSlots)//when id is passed of doctor the slots of his which  is booked and not booked is send to him and shd display only available slots for the patient
.post(bookAppointment);//when patient id is passed as post request to book appointment

module.exports = patientRouter;