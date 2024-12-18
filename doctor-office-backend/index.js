const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');




const app = express();
app.use(cors());

app.use(express.json());


const mongodb_url = process.env.MONGODB_URL || 'mongo:27017'
mongoose.connect(`mongodb://${mongodb_url}/appointments?replicaSet=rs0`, { useNewUrlParser: true, useUnifiedTopology: true });


const AppointmentSchema = new mongoose.Schema({
    patientName: String,
    doctorName: String,
    date: Date,
});


const Appointment = mongoose.model('Appointment', AppointmentSchema);


app.get('/appointments', async (req, res) => {
    const appointments = await Appointment.find();
    res.json(appointments);
});


app.post('/appointments', async (req, res) => {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.json(appointment);
});


app.listen(3000, () => {
    console.log('Server running on port 3000. Enjoy!');
});