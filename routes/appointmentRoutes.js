const {Appointment, validate} = require('../models/appointmentModel')
const { Patient } = require('../models/patientModel')
const express = require('express')
const router = express.Router()

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

// Get a list of all appointments for a specific patient - Have to do it. Man :) Note: This will happen In patient Route Man. Bcz patient document has all the appointments in an array. So, It would be easy & also should do in Pateint Man.
router.get('/patients/:id', async (req, res) => {
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

        // 2. Also, I should add this appointment in Patient Document

        res.send(newAppointment)
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

    const genre = await Genre.findById(req.body.genreId)
    // if not found, return 404 (Resource not found)
    if(!genre) {
        return res.status(404).send('The genre with given ID was not found')
    }

    // if Valid, then find the Customer and Update it.
    let appointment = await Appointment.findByIdAndUpdate(req.params.id, { 
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name,
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate, 
    }, {
        new: true
    })

    if(!appointment) {
        return res.status(404).send("The Appointment with given ID was not found")
    }

    res.send(appointment)
})

router.delete('/:id', async (req, res) => {
    // Check if given id Appointment exist or not
    const appointment = await Appointment.findByIdAndRemove(req.params.id)

    if(!appointment) {
        return res.status(404).send("The Appointment with given ID was not found")
    }

    res.send(appointment) // return the Appointment, which is deleted
})

// Export all the routes
module.exports = router