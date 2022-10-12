const asyncHandler = require("express-async-handler")

const { Appointment, validate } = require("../models/appointmentModel")
const { Patient } = require("../models/patientModel")
const {
  getTodayDate,
  getSecondDate,
  getStringDate,
  getNumOfWeeks,
  validCurrency,
  getFee,
} = require("../utils/utils")

// @desc Get all appointments
// @route GET /api/appointments
// @acess Public
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({})
    .populate("patient", "name")
    .sort("date")
  res.send(appointments)
})

// @desc Fetch single appointment
// @route GET /api/appointments/:id
// @acess Public
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    "patient",
    "name"
  )
  if (!appointment) {
    res.status(404)
    throw new Error(`The appointment with Id ${req.params.id} was not found`)
  }

  res.send(appointment)
})

// @desc Delete a appointment
// @route DELETE /api/appointments/:id
// @acess Public
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndRemove(req.params.id)
  if (!appointment) {
    res.status(404)
    throw new Error(`The appointment with Id ${req.params.id} was not found`)
  }

  const patient = await Patient.findById(appointment.patient)
  if (!patient) {
    res.status(404)
    throw new Error(`The patient with Id ${appointment.patient} was not found`)
  }
  const index = patient.appointments.indexOf(req.params.id)
  if (index > -1) {
    patient.appointments.splice(index, 1)
  }

  await patient.save()
  res.send(appointment)
})

// @desc Create new appointment
// @route POST /api/appointments
// @acess Public
const createAppointment = asyncHandler(async (req, res) => {
  const { error } = validate(req.body)
  if (error) {
    res.status(404)
    throw new Error(error.details[0].message)
  }

  const patient = await Patient.findById(req.body.patientId)
  if (!patient) {
    res.status(404)
    throw new Error("No Such Patient Exist. Send Valid Patient Id")
  }

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

  //
  await newAppointment.save()
  patient.appointments.push(newAppointment._id)
  await patient.save()
  res.send(newAppointment)
})

// @desc Update a appointment
// @route PUT /api/appointments/:id
// @acess Public
const updateAppointment = asyncHandler(async (req, res) => {
  const { error } = validate(req.body)
  if (error) {
    res.status(404)
    throw new Error(error.details[0].message)
  }

  let appointment = await Appointment.findById(req.params.id)
  if (!appointment) {
    res.status(404)
    throw new Error(`The appointment with Id ${req.params.id} was not found`)
  }

  const patient = await Patient.findById(req.body.patientId)
  if (!patient) {
    res.status(404)
    throw new Error(
      "The patient with given ID doesn't exist. Try to send Valid Patient Id"
    )
  }

  if (!patient._id.equals(appointment.patient)) {
    res.status(404)
    throw new Error(
      "The Patient Id does not match with Appointment's Patient Id.(Means you are trying to update another patient appointment)"
    )
  }

  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      description: req.body.description,
      fee: req.body.fee,
      currency: req.body.currency,
      isPaid: req.body.isPaid,
      day: req.body.day,
      date: req.body.date,
      patient: req.body.patientId,
    },
    {
      new: true,
    }
  )

  res.send(appointment)
})

// @desc Get a list of all appointments for a specific patient, a specific day, unpaid appointments.
// @route GET /api/appointments/findAll?day=monday&patientId=633d8b849f4ffb31cef2d5b2&unpaid=true or you can pass (any, None) of the query Paramters.
// @acess Public
const findAllAppointments = asyncHandler(async (req, res) => {
  if (req.query.patientId) {
    const patient = await Patient.findById(req.query.patientId)
    if (!patient) {
      res.status(404)
      throw new Error(`The patient with Id ${req.query.patientId} was not found`)
    }
  }

  let unpaid
  if (req.query.unpaid === "true") {
    unpaid = "false"
  } else {
    unpaid = "true"
  }

  const appointments = await Appointment.find()
    .and([
      { ...(req.query.patientId ? { patient: req.query.patientId } : {}) },
      { ...(req.query.day ? { day: req.query.day } : {}) },
      { ...(req.query.unpaid ? { isPaid: unpaid } : {}) },
    ])
    .populate("patient", "name")
    .sort("date")

  res.send(appointments)
})

// @desc Get a remaining bill for a specific patient, a specific period(weekly, monthly, yearly), a specific Currency.
// @route GET /api/appointments/remainingBill?patientId=633d8b849f4ffb31cef2d5b2&currency=eur&period=weekly or you can pass (any, None) of the query Paramters.
// @acess Public
const getRemainingBill = asyncHandler(async (req, res) => {
  if (req.query.patientId) {
    const patient = await Patient.findById(req.query.patientId)
    if (!patient) {
      res.status(404)
      throw new Error(`The patient with Id ${req.query.patientId} was not found`)
    }
  }

  let today = getTodayDate()
  let numOfWeeks = getNumOfWeeks(req.query.period)
  let secondDate = getSecondDate(numOfWeeks, today)
  today = getStringDate(today)
  secondDate = getStringDate(secondDate)

  if (req.query.currency && !validCurrency(req.query.currency)) {
    res.status(404)
    throw new Error(
      "You can only get Bill in Euro or USD. So, try to send to Valid Currency."
    )
  }

  const appointments = await Appointment.find({
    ...(req.query.period ? { date: { $gte: secondDate, $lte: today } } : {}),
  }).and([
    { ...(req.query.patientId ? { patient: req.query.patientId } : {}) },
  ])

  const requiredCurrency = req.query.currency ? req.query.currency : "usd"
  const fee = getFee(appointments, requiredCurrency)

  const bill = {}
  bill.currency = requiredCurrency
  if (req.query.patientId) {
    bill.remainingBill = fee.unpaid
    return res.send(bill)
  } else {
    bill.unpaid = fee.unpaid
  }
  bill.paid = fee.paid
  const total = bill.paid + bill.unpaid
  bill.balance = total - bill.paid

  res.send(bill)
})

// Exports Here
module.exports.createAppointment = createAppointment
module.exports.getAppointments = getAppointments
module.exports.getAppointmentById = getAppointmentById
module.exports.updateAppointment = updateAppointment
module.exports.deleteAppointment = deleteAppointment
module.exports.findAllAppointments = findAllAppointments
module.exports.getRemainingBill = getRemainingBill
