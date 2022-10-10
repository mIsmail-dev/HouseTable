const {Appointment, validate} = require('../models/appointmentModel')
const { Patient } = require('../models/patientModel')
const express = require('express')
const router = express.Router()
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    findAllAppointments,
    getRemainingBill,
} = require('../controllers/appointmentController')

router.route('/').get(getAppointments).post(createAppointment)
router.route('/findAll').get(findAllAppointments)
router.route('/remainingBill').get(getRemainingBill)
router
    .route('/:id')
    .get(getAppointmentById)
    .delete(deleteAppointment)
    .put(updateAppointment)

// Export all the routes
module.exports = router