const express = require('express')
const router = express.Router()
const { 
    createPatient,
    getPatients, 
    getPatientById,
    updatePatient,
    deletePatient,
    getMostPopularPet
} = require('../controllers/patientController')
const { validationHandler } = require('../middleware/validateMiddleware')

router.route('/').get(getPatients).post(validationHandler, createPatient)
router.route('/mostPopular').get(getMostPopularPet)
router
    .route('/:id')
    .get(getPatientById)
    .delete(deletePatient)
    .put(updatePatient)

// Export all the routes
module.exports = router