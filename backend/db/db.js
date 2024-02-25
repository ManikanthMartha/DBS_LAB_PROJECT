//everytime from req taken see to check that like valid add that for everything

const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: {
      require: true,
    },
  });


//sending usernames according to role 
async function docusers(email) {
    try {
        //seeing if for that role that username exists
        const result  = await pool.query('SELECT email FROM doctors_login WHERE email=?', [email]);
        console.log(result);
        if(result[0].length === 0){//no user
            return null;
        }
        //if username is there then
        const Email = result[0].map(Email => Email.email);
        console.log(Email);
        return Email[0];
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
//returning password from the db
async function docpassword(email){
    try{
        //get password object
        const result = await pool.query('SELECT password FROM doctors_login WHERE Email = ?', [email]);
        pass = result[0].map(pass => pass.password);
        console.log(pass);
        return pass[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}
//returning the doctor_id based on username
async function doctor_id(email){
    try{
        const result = await pool.query('SELECT Doctor_ID FROM doctor_details WHERE Email = ?', [email]);
        doctor_id = result[0].map(doctor_id => doctor_id.Doctor_ID);
        console.log(doctor_id);
        return doctor_id[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}
async function patusers(email) {
    try {
        //seeing if for that role that username exists
        const result  = await pool.query('SELECT email FROM patient_login WHERE email=?', [email]);
        console.log(result);
        if(result[0].length === 0){//no user
            return null;
        }
        //if username is there then
        const Email = result[0].map(Email => Email.email);
        console.log(Email);
        return Email[0];
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
//returning password from the db
async function patpassword(email){
    try{
        //get password object
        const result = await pool.query('SELECT password FROM patient_login WHERE Email = ?', [email]);
        pass = result[0].map(pass => pass.password);
        console.log(pass);
        return pass[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}
async function patient_id(email){
    try{
        const result = await pool.query('SELECT Patient_ID FROM patient_info WHERE Email = ?', [email]);
        patient_id = result[0].map(patient_id => patient_id.Patient_ID);
        console.log(patient_id);
        return patient_id[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}
//returning the patient details from the database
async function getpatientData(req, res) {
    try {
        const id = req.Patient_ID; // Getting the patient_id from the authenticated wala
        const patient_info = await pool.query('SELECT * FROM patient_info WHERE patient_id = ?', [id]);
        const medical_history = await pool.query('SELECT * FROM medical_history WHERE patient_id = ?', [id]);
        const tests = await pool.query('SELECT * FROM patient_tests WHERE patient_id = ?', [id]);

        if (patient_info.length === 0) {//if no record then the query gives an empty array
            return res.status(404).send({ error: 'Patient not found' });
        }

        const responseData = {
            patient_info: patient_info[0], // Assuming patient_info has only one record
            medical_history: medical_history.length > 0 ? medical_history[0] : null,
            tests: tests.length > 0 ? tests[0] : null
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

//when the patient is new and enters the detials and posted
async function addpatientData(req, res) {//to do something missing ka hai like patid adding then inserting ka and all
    try {
        const patId = req.params.id;//new user shd be given a new pat id check how
        const { patient_info, medical_history, tests } = req.body;
        // Validate patient_info
        const patientInfoKeys = ['first_name', 'last_name', 'gender', 'address', 'contact', 'email'];//age ka see once add that
        if (!validateFields(patient_info, patientInfoKeys)) {
            return res.status(400).send({ message: 'Missing or invalid fields in patient_info' });
        }

        // Validate medical_history
        const medicalHistoryKeys = ['Diagnosis', 'Date_of_Diagnosis', 'Treatment_received', 'chronic_conditions'];
        if (!validateFields(medical_history, medicalHistoryKeys)) {
            return res.status(400).send({ message: 'Missing or invalid fields in medical_history' });
        }

        // Validate tests
        const testsKeys = ['test_name', 'test_date', 'test_result'];
        if (!validateFields(tests, testsKeys)) {
            return res.status(400).send({ message: 'Missing or invalid fields in tests' });
        }

        // Insert data into respective tables
        await pool.query('INSERT INTO patient_info SET ?', patient_info);
        await pool.query('INSERT INTO medical_history SET ?', medical_history);
        await pool.query('INSERT INTO patient_tests SET ?', tests);//set will tell to which columns which are in tests properties

        res.status(201).send({ message: 'Patient data added successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    /*
    if the query ka error comes then to handle that (whenevr a error in query it comes as sqlmessage ka in th error object)
    catch (err) {
        console.error('Error:', err);
        if (err.code === 'ER_DUP_ENTRY') { // Check for duplicate entry error(are codes of query error)
            return res.status(400).send({ error: 'Duplicate entry error: This patient already exists' });
        } else if (err.code === 'ER_NO_REFERENCED_ROW') { // Check for foreign key constraint violation
            return res.status(400).send({ error: 'Foreign key constraint violation: Invalid reference' });
        } else if (err.message.includes('your_constraint_name')) { // Check for specific constraint violation
            return res.status(400).send({ error: 'Constraint violation: Your specific constraint message here' });
        }
        
        res.status(500).send({ error: 'Internal Server Error' });
    }
    */
}

function validateFields(data, requiredKeys) {
    for (const key of requiredKeys) {
        if (!data.hasOwnProperty(key) || data[key] === null || data[key] === undefined || data[key] === '') {
            return false;
        }//.hasOwnPropery will check if the key is present in the object(here data)
    }
    return true;
}

//upcoming appointments sending for the patient dashboard
async function dashboardSend(req, res) {
    try {
        const id = req.Patient_ID;

        const appointmentsResult = await pool.query('SELECT Doctor_name, Date_of_appointment, slot_time FROM appointment a JOIN doctors d ON a.Doctor_id = d.Doctor_id JOIN slots s ON a.Slot_No = s.Slot_No WHERE patient_id = ? AND status = ?', [id, 'pending']);
        
        const prescriptionResult = await pool.query('SELECT Medication_Name, Dosage, Frequency FROM prescription_table WHERE patient_id = ?', [id]);

        const testsResult = await pool.query('SELECT t.name_of_test,date_of_test FROM doctor_tests d join tests_names t on d.name_of_test = t.test_id WHERE patient_id = ?', [id]);

        const responseData = {
            appointments: appointmentsResult.length > 0 ? appointmentsResult[0] : null,//null so client can see if null then tell no appointments like that 
            prescription: prescriptionResult.length > 0 ? prescriptionResult[0] : null,
            tests: testsResult.length > 0 ? testsResult[0] : null
        };

        res.status(200).send(responseData); // sends the response as json as( responseData is object )
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

//when the patient enters the appointment booking he selects the department and the date(day is got)
async function availableDoctors(req, res) {
    try {
        const department = req.body.department;
        const date = req.body.date;//in format of yyyy-mm-dd
        // Extract day from date
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        // Check if the provided date is a holiday
        const holidayCheckResult = await pool.query('SELECT * FROM Holidays WHERE date = ?', [date]);
        //the first array will have result of date and next some primary key ka so checking of first ka 
        if (holidayCheckResult[0].length != 0) {//the first in array will hold the date if 0 means not holiday
            // The selected day is a holiday
            return res.send({ message: "The selected day is a holiday" });
        } else {
            // Retrieve doctors available for the provided department and day
            const doctors = await pool.query('SELECT doctor_name FROM OPD_DAY NATURAL JOIN Doctors WHERE opd_week_day = ? AND department = ?', [day, department]);
            
            // Send the list of available doctors as response
            res.status(200).send({"available doctors": doctors[0]});
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

//once the doctor selected from the available doctors,show slots of it
async function appointmentSlots(req, res) {
    try {
        const docId = req.params.id2;//2 ids passed so id2
        const date = req.body.date;
        /*const slots = await pool.query('SELECT slot_no, slot_time FROM slot_details NATURAL JOIN slots WHERE doctor_id = ? AND date = ?', [docId, date]);
        console.log(slots);
        // here slots will be an array of objects with time and slot_no; total slots is 22
        let allSlots = await pool.query('SELECT slot_no FROM slots');
        console.log(allSlots);
        // allSlots has all slots
        let slotDetails = [];
        for (let i = 0; i < allSlots.length; i++) {
            let slotNo = allSlots[i].slot_no;
            if (slots[0].some(slot => slot.slot_no === slotNo)) {
                slotDetails.push({ [slotNo]: "booked" });
            } else {
                slotDetails.push({ [slotNo]: "not booked" });
            }
        }*/
        const availableSlotsQuery = `
            SELECT s.slot_no
            FROM slots s
            LEFT JOIN slot_details sd ON s.slot_no = sd.slot_no
                                    AND sd.doctor_id = ?
                                    AND sd.date = ?
            WHERE sd.slot_no IS NULL;
        `;

        const [availableSlotsRows, _] = await pool.query(availableSlotsQuery, [docId, date]);
        const availableSlots = availableSlotsRows.map(row => row.slot_no);
        res.status(200).send(availableSlots);//will send only the available slots
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}


//once the patient selects the doctora and slots shown and books the details stored in appointments and in the slot_details
async function bookAppointment(req, res) {
    try {
        const patId = req.params.id1;
        const docId = req.params.id2;
        const {slot_no, date, department, reason_of_appointment } = req.body;
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        // Insert into appointments
        await pool.query('INSERT INTO appointment (doctor_id, patient_id, department,date_of_appointment, slot_no, status, reason_of_appointment) VALUES (?, ?, ?, ?, ?, ?,?)', [docId, patId, department,date, slot_no, 'pending', reason_of_appointment]);
        
        // Insert into slot_details
        await pool.query('INSERT INTO slot_details (slot_no, date, day, patient_id, doctor_id) VALUES (?, ?, ?, ?, ?)', [slot_no, date, day, patId, docId]);
        
        res.status(201).send({ message: 'Appointment booked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

module.exports = { docusers,docpassword,doctor_id,patient_id,patusers,patpassword,getpatientData, addpatientData, dashboardSend,availableDoctors,appointmentSlots,bookAppointment};