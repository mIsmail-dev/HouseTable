const asyncHandler = require("express-async-handler");
const { Patient, validate } = require("../models/patientModel");

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
    throw new Error("The patient with given ID was not found");
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
    throw new Error("The patient with given ID was not found");
  }

  res.send(patient);
});

// @desc Create new patient
// @route POST /api/patients
// @acess Public
const createPatient = asyncHandler(async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

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
    throw new Error("The patient with given ID was not found");
  }

  res.send(patient);
});

// @desc Get most popular patient/pet
// @route GET /api/patients/mostPopular
// @acess Public
const getMostPopularPet = asyncHandler(async (req, res) => {
  const patients = await Patient.find().populate("appointments", "fee isPaid");

  const result = {};

  let max = 0;
  result.popularPet = patients.reduce((acc, patient) => {
    if (patient.appointments.length > max) {
      max = patient.appointments.length;
      acc.id = patient._id;
      acc.name = patient.name;
      acc.totalAppointments = max;
    }
    return acc;
  }, {});

  result.petsDetail = patients.reduce((acc, patient) => {
    const petDetail = {};
    petDetail.id = patient._id;
    petDetail.name = patient.name;
    petDetail.totalFeePaid = patient.appointments.reduce((sum, appointment) => {
      if (appointment.isPaid) {
        sum = sum + appointment.fee;
      }
      return sum;
    }, 0);
    petDetail.totalFeeUnPaid = patient.appointments.reduce(
      (sum, appointment) => {
        if (!appointment.isPaid) {
          sum = sum + appointment.fee;
        }
        return sum;
      },
      0
    );

    acc.push(petDetail);
    return acc;
  }, []);

  res.send(result);
});

// Exports Here
module.exports.createPatient = createPatient;
module.exports.getPatients = getPatients;
module.exports.getPatientById = getPatientById;
module.exports.updatePatient = updatePatient;
module.exports.deletePatient = deletePatient;
module.exports.getMostPopularPet = getMostPopularPet;
