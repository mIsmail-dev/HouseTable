const morgan = require('morgan')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')
const express = require('express')

const patientRoutes = require('./routes/patientRoutes')

const app = express()

mongoose.connect('mongodb://localhost/houseTable')
    .then(() => console.log('Connected to MongoDb...'))
    .catch((err) => console.log('Could not connect to MongoDb...', err.message))

// Added Builtin Middlewares Here
app.use(express.json())
app.use(morgan('tiny'))

app.use('/api/patients', patientRoutes)

app.get('/', (req, res) => {
    res.send('App is running...')
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Listening at Port ${port}...`))