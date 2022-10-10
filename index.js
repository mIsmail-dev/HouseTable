const morgan = require('morgan')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const express = require('express')
const colors = require("colors")
const dotenv = require("dotenv").config()
const connectDB = require("./config/db")

const patientRoutes = require('./routes/patientRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes')

const app = express()

// Connect to database
connectDB()

// Added Builtin Middlewares Here
app.use(express.json())
app.use(morgan('tiny'))

// Routes
app.use('/api/patients', patientRoutes)
app.use('/api/appointments', appointmentRoutes)

app.get('/', (req, res) => {
    res.send('App is running...')
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Listening at Port ${port}...`))