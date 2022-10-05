const {Patient, validate} = require('../models/patientModel')
const { Appointment } = require('../models/appointmentModel')
const express = require('express')
const router = express.Router()


router.get('/', async (req, res) => {
    const patients = await Patient.find({}).sort('name')
    res.send(patients)
})

router.get('/:id', async (req, res) => {
    try {
        // find customer Here
        const patient = await Patient.findById(req.params.id)

        // if not found, return 404 (Resource not found)
        if(!patient) {
            return res.status(404).send('The patient with given ID was not found')
        }

        // if found then return the Appointment
        res.send(patient)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }

    
})

// Note - we are doing this bcz what if Appointment has 50 properties, we don't want to add 50. we just want to add the properties which we want. Also, _v is also present in a document, we also don't want to add it. That's why we choose this method man.

router.post('/', async (req, res) => {
    console.log("In POST Request.")
    const {error} = validate(req.body)

    if(error) {
        // 400 - Bad Request
        return res.status(400).send(error.details[0].message)
    }

    // console.log("Genre Id: ", req.body.genreId)

    // Check if the Appointments which user has given are of the same Patient or not. And Check if the given Appointments are present are not
    req.body.appointments && req.body.appointments.forEach(async (appointmentId) => {
        const appointment = await Appointment.findById(req.body.appointmentId)
        // if not found, return 404 (Resource not found)
        if(!appointment) {
            return res.status(404).send('The appointment with given ID was not found')
        } 

        if(appointment.patient !== req.params.id) {
            return res.status(404).send('You cannot assign other Patient Appointments. You can only assign Your Appointments.')
        }
    });
    
    // Valid
    const newPatient = new Patient({
        name: req.body.name,
        type: req.body.type,
        ownerName: req.body.ownerName,
        ownerAddress: req.body.ownerAddress,
        ownerPhoneNo: req.body.ownerPhoneNo,
        // appointments: req.body.appointments,
    })

    try {
        await newPatient.save() // - We don't need to get Patient Object from .save() method bcz Id is genrated by Mongod(Mongo Driver), not mongodb. So, we can change let newPatient to const Patient xd.
        res.send(newPatient)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
    
    
})

router.put('/:id', async (req, res) => {
    const {error} = validate(req.body)
    if(error) {
        // 400 - Bad Request
        return res.status(400).send(error.details[0].message)
    }

    // Check if the Appointments which user has given are of the same Patient or not. And Check if the given Appointments are present are not
    req.body.appointments && req.body.appointments.forEach(async (appointmentId) => {
        const appointment = await Appointment.findById(req.body.appointmentId)
        // if not found, return 404 (Resource not found)
        if(!appointment) {
            return res.status(404).send('The appointment with given ID was not found')
        } 

        if(appointment.patient !== req.params.id) {
            return res.status(404).send('You cannot assign other Patient Appointments. You can only assign Your Appointments.')
        }
    });

    // if Valid, then find the Customer and Update it.
    try {
        let patient = await Patient.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            type: req.body.type,
            ownerName: req.body.ownerName,
            ownerAddress: req.body.ownerAddress,
            ownerPhoneNo: req.body.ownerPhoneNo,
            appointments: req.body.appointments,
        }, {
            new: true
        })
    
        if(!patient) {
            return res.status(404).send("The Patient with given ID was not found")
        }
    
        res.send(patient)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
    
})

router.delete('/:id', async (req, res) => {
    try {
        // Check if given id genre exist or not
        const patient = await Patient.findByIdAndRemove(req.params.id)

        if(!patient) {
            return res.status(404).send("The Patient with given ID was not found")
        }

        res.send(patient) // return the genre, which is deleted
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
    
})

// Export all the routes
module.exports = router