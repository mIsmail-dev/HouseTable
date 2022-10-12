const asyncHandler = require("express-async-handler");
const { Patient, validate } = require("../models/patientModel");

const {
    getPopularPet,
    getEveryPetDetails,
} = require('../utils/utils')

// @desc Get all patients
// @route GET /api/patients
// @acess Public
const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({}).sort("name");
  res.send(patients);
});

// @desc Fetch single patient
// @route GET /api/patients/:id
// @acess Public
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error(`The patient with Id ${req.params.id} was not found`);
  }

  res.send(patient);
});

// @desc Delete a patient
// @route DELETE /api/patients/:id
// @acess Public
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndRemove(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error(`The patient with Id ${req.params.id} was not found`);
  }

  res.send(patient);
});

// @desc Create new patient
// @route POST /api/patients
// @acess Public
const createPatient = asyncHandler(async (req, res) => {

  const newPatient = new Patient({
    name: req.body.name,
    type: req.body.type,
    ownerName: req.body.ownerName,
    ownerAddress: req.body.ownerAddress,
    ownerPhoneNo: req.body.ownerPhoneNo,
  });

  await newPatient.save();
  res.status(201).send(newPatient);
});

// @desc Update a patient
// @route PUT /api/patients/:id
// @acess Public
const updatePatient = asyncHandler(async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  let patient = await Patient.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      type: req.body.type,
      ownerName: req.body.ownerName,
      ownerAddress: req.body.ownerAddress,
      ownerPhoneNo: req.body.ownerPhoneNo,
    },
    {
      new: true,
    }
  );

  if (!patient) {
    res.status(404);
    throw new Error(`The patient with Id ${req.params.id} was not found`);
  }

  res.send(patient);
});

// @desc Get most popular patient/pet
// @route GET /api/patients/mostPopular
// @acess Public
const getMostPopularPet = asyncHandler(async (req, res) => {
  const patients = await Patient.find().populate("appointments", "fee isPaid");

  const result = {};
  result.popularPet = getPopularPet(patients)
  result.petsDetail = getEveryPetDetails(patients)

  res.send(result);
});

// Exports Here
module.exports.createPatient = createPatient;
module.exports.getPatients = getPatients;
module.exports.getPatientById = getPatientById;
module.exports.updatePatient = updatePatient;
module.exports.deletePatient = deletePatient;
module.exports.getMostPopularPet = getMostPopularPet;
