const {Patient, validate} = require('../models/patientModel')
const { Appointment } = require('../models/appointmentModel')

// @desc Get all patients
// @route GET /api/patients
// @acess Public
const getPatients = async (req, res) => {
    const patients = await Patient.find({}).sort('name')
    res.send(patients)
}

// @desc Fetch single patient
// @route GET /api/patients/:id
// @acess Public
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
        if(!patient) {
            return res.status(404).send('The patient with given ID was not found')
        }

        res.send(patient)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
}

// @desc Delete a patient
// @route DELETE /api/patients/:id
// @acess Public
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndRemove(req.params.id)
        if(!patient) {
            return res.status(404).send("The Patient with given ID was not found")
        }

        res.send(patient)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
    
}

// @desc Create new patient
// @route POST /api/patients
// @acess Public
const createPatient = async (req, res) => {
    const {error} = validate(req.body)
    if(error) {
        // 400 - Bad Request
        return res.status(400).send(error.details[0].message)
    }

    const newPatient = new Patient({
        name: req.body.name,
        type: req.body.type,
        ownerName: req.body.ownerName,
        ownerAddress: req.body.ownerAddress,
        ownerPhoneNo: req.body.ownerPhoneNo,
    })

    try {
        await newPatient.save()
        res.send(newPatient)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
}

// @desc Update a patient
// @route PUT /api/patients/:id
// @acess Public
const updatePatient = async (req, res) => {
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
            // appointments: req.body.appointments,
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
    
}

// @desc Get most popular patient/pet
// @route GET /api/patients/mostPopular
// @acess Public
const getMostPopularPet = async (req, res) => {
    try {
        const patients = await Patient.find()
                                        .populate('appointments', 'fee isPaid')

        const result = {}

        // 1. Finding the the most popular pet Here
        let max = 0
        result.popularPet = patients.reduce((acc, patient) => {
            if(patient.appointments.length > max) {
                max = patient.appointments.length
                acc.id = patient._id
                acc.name = patient.name
                acc.totalAppointments = max
            }
            return acc
        }, {})

        // 2. how much money from each pet
        result.petsDetail = patients.reduce((acc, patient) => {
            const petDetail = {}
            petDetail.id = patient._id
            petDetail.name = patient.name
            // Counting Patient Paid Fee
            petDetail.totalFeePaid = patient.appointments.reduce((sum, appointment) => {
                if(appointment.isPaid) {
                    console.log("hahah")
                    sum = sum + appointment.fee
                }
                return sum
            }, 0)
            // Counting Patient UnPaid Fee
            petDetail.totalFeeUnPaid = patient.appointments.reduce((sum, appointment) => {
                if(!appointment.isPaid) {
                    sum = sum + appointment.fee
                }
                return sum
            }, 0)

            acc.push(petDetail)
            return acc
        }, [])

        res.send(result)
    } catch (err) {
        console.log("Error: ", err.message)
        res.status(404).send(err.message)
    }
    
}

// Exports Here
module.exports.createPatient = createPatient
module.exports.getPatients = getPatients
module.exports.getPatientById = getPatientById
module.exports.updatePatient = updatePatient
module.exports.deletePatient = deletePatient
module.exports.getMostPopularPet = getMostPopularPet