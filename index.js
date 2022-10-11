const morgan = require('morgan')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const express = require('express')
const colors = require("colors")
const dotenv = require("dotenv").config()
const connectDB = require("./config/db")

const patientRoutes = require('./routes/patientRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes')

// Connect to database
connectDB()

const app = express()

// Added Builtin Middlewares Here
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.use(express.json())

// Routes
app.use('/api/patients', patientRoutes)
app.use('/api/appointments', appointmentRoutes)

app.get('/', (req, res) => {
    res.send('App is running...')
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow.bold))