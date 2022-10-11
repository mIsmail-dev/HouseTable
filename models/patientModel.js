const mongoose = require('mongoose')
const Joi = require('joi')

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    type: {
        type: String,
        enum: ['cat', 'dog', 'bird'],
        required: true,
    },
    ownerName: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    ownerAddress: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    ownerPhoneNo: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 55
    },
    appointments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Appointment',
        default: []
    }
})

const Patient = new mongoose.model('Patient', patientSchema)

const validPatient = (patient) => {
    const schema = {
        name: Joi.string().min(5).max(255).required(),
        type: Joi.string().required(),
        ownerName: Joi.string().min(5).max(255).required(),
        ownerAddress: Joi.string().min(5).max(255).required(),
        ownerPhoneNo: Joi.string().min(5).max(55).required(),
        appointments: Joi.array().items(Joi.objectId()),
    }

    return Joi.validate(patient, schema)
}

// Exports Here
module.exports.Patient = Patient
module.exports.validate = validPatient