const {Appointment, validate} = require('../models/appointmentModel')
const { Patient } = require('../models/patientModel')
const mongoose = require('mongoose')
const express = require('express')
const e = require('express')
const router = express.Router()

// Get a list of all appointments for a specific patient. , Get a list of appointments for a specific day. , Get a list of unpaid appointments.
router.get('/findAll', async (req, res) => {
    try {

        let unpaid;
        if(req.query.unpaid === "true") {
            console.log("Hahahah")
            unpaid = 'false'
        } else {
            unpaid = 'true'
        }

        // console.log("Patient Id: ", req.query.patientId)
        // console.log("day: ", req.query.day)
        // console.log("unpaid: ", unpaid)
        
        if(req.query.patientId) {
            // Find the Patient by Given PatientId
            const patient = await Patient.findById(req.query.patientId)
            // if not found, return 404 (Resource not found)
            if(!patient) {
                return res.status(404).send('The patient with given ID was not found')
            }
        }

        // Used Optional Spread Operators for this Query

        // const arr = [ { ...(req.query.patientId ? { patient: req.query.patientId} : {})},
        //     {...(req.query.day ? { day: req.query.day } : {}) },
        //     {...(req.query.unpaid ? { isPaid: unpaid } : {}) } ]

        // console.log("Arr: ", arr)
        
        // find Appointments with Given Query Strings Here
        const appointments = await Appointment
                                        .find() // { patient: req.query.patientId,  day: req.query.day  }
                                        .and([ { ...(req.query.patientId ? { patient: req.query.patientId} : {}) }, // Used Optional Spread Operators for this Query
                                            {...(req.query.day ? { day: req.query.day } : {}) },
                                            {...(req.query.unpaid ? { isPaid: unpaid } : {}) } ])
                                        // .or([ { patient: req.query.patientId }, { day: req.query.day } ])
                                        .populate('patient', 'name') // Populate will fetch the data from the refrence document. (-_id is for Ignoring this Feild)
                                        .sort("date")

        // if found then return the Appointment
        res.send(appointments)
    } catch (err) {
        // res.send("Hi, There")
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
    
})

router.get('/', async (req, res) => {
    const appointments = await Appointment.find({}).sort('date')
    res.send(appointments)
})

router.get('/:id', async (req, res) => {
    try {
        // find Appointment Here
        const appointment = await Appointment.findById(req.params.id)

        // if not found, return 404 (Resource not found)
        if(!appointment) {
            return res.status(404).send('The appointment with given ID was not found')
        }

        // if found then return the Appointment
        res.send(appointment)   
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
    
})

// Note - we are doing this bcz what if Appointment has 50 properties, we don't want to add 50. we just want to add the properties which we want. Also, _v is also present in a document, we also don't want to add it. That's why we choose this method man.
router.post('/', async (req, res) => {
    const {error} = validate(req.body)

    if(error) {
        // 400 - Bad Request
        return res.status(400).send(error.details[0].message)
    }

    // Find the Patient by Given PatientId
    const patient = await Patient.findById(req.body.patientId)
    // if not found, return 404 (Resource not found)
    if(!patient) {
        return res.status(404).send('The patient with given ID was not found')
    }

    // Valid
    const newAppointment = new Appointment({
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        description: req.body.description,
        fee: req.body.fee,
        currency: req.body.currency,
        isPaid: req.body.isPaid,
        day: req.body.day,
        date: req.body.date,
        patient: req.body.patientId,
    })

    try {
        // Should use Transaction Here Man, But I have to check Fawn Library (it's giving me error when tried Last Time. Need to fix it) or I can use Two Phase Commits Manualy But I have to do Learn that first :) OR I can use Pre Trigger Here Man.
        await newAppointment.save() // - We don't need to get Appointment Object from .save() method bcz Id is genrated by Mongod(Mongo Driver), not mongodb. So, we can change let newAppointment to const newAppointment xd.

        // 2. Also, I should add this appointment in Patient Document. Bcz Patient has Array of all its Appointments. So, we should also add in that array
        console.log("New Appointment Id: ", newAppointment._id)

        patient.appointments.push(newAppointment._id) // Adding the current Appointment id in its Patient Appointments Array.

        try {
            await patient.save()
            res.send(newAppointment)
        } catch (err) {
            console.log("Error: ", err.message)
            console.log("Should Roll Back to Inital Database State. - Appointment is Added in Database :/")
            // 500 - Internal Server Error
            res.status(500).send(err.message)
        }
        
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

    // find Appointment Here
    let appointment = await Appointment.findById(req.params.id)

    // if not found, return 404 (Resource not found)
    if(!appointment) {
        return res.status(404).send('The appointment with given ID was not found')
    }

    // 2. Find the Patient by Given PatientId
    const patient = await Patient.findById(req.body.patientId)
    // if not found, return 404 (Resource not found)
    if(!patient) {
        return res.status(404).send('The patient with given ID was not found')
    }

    try {
        // if Valid, then find the Appointment and Update it.
        appointment = await Appointment.findByIdAndUpdate(req.params.id, { 
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            description: req.body.description,
            fee: req.body.fee,
            currency: req.body.currency,
            isPaid: req.body.isPaid,
            day: req.body.day,
            date: req.body.date,
            patient: req.body.patientId, 
        }, {
            new: true
        })

        if(!appointment) {
            return res.status(404).send("The Appointment with given ID was not found")
        }

        res.send(appointment)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
})

router.delete('/:id', async (req, res) => {
    // Check if given id Appointment exist or not
    const appointment = await Appointment.findByIdAndRemove(req.params.id)

    if(!appointment) {
        return res.status(404).send("The Appointment with given ID was not found")
    }

    //2. Remove this Appointment, also from the Appointment array of the patient.
    const patient = await Patient.findById(appointment.patient)

    // if not found, return 404 (Resource not found)
    if(!patient) {
        return res.status(404).send('The patient with given ID was not found')
    }

    const index = patient.appointments.indexOf(req.params.id);
    if (index > -1) { // only splice array when item is found
        patient.appointments.splice(index, 1); // 2nd parameter means remove one item only
    }

    try {
        await patient.save()
        res.send(appointment) // return the Appointment, which is deleted
    } catch (error) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
})

// Export all the routes
module.exports = router