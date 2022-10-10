// will return today Date
const getTodayDate = () => {
    let today = new Date()
    const dd = String(today.getDate() + 1).padStart(2, '0') // added 1 bcz it was giving one previous day like if today is 7 it will give 6.
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear()
    today = mm + '-' + dd + '-' + yyyy;
    return new Date(today)
}

// will return second Date w.r.t to numOfWeeks. Basically Current Date - numofWeeks.
const getSecondDate = (numOfWeeks, todayDate) => {
    let secondDate = new Date()
    secondDate.setDate(todayDate.getDate() - numOfWeeks * 7)
    return secondDate
}

// will convert iso string into a string and will return it
const getStringDate = (today) => {
    const dd = String(today.getDate()).padStart(2, '0') // added 1 bcz it was giving one previous day like if today is 7 it will give 6.
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear()
    today = mm + '-' + dd + '-' + yyyy;
    return today
}

// will return numOfWeeks w.r.t time period(weekly,  monthly, yearly)
const getNumOfWeeks = (period) => {
    if(period === "weekly") {
        return 1
    } else if(period === "monthly") {
        return 4
    } else {
        return 12 // for yearly
    }
}

// will check if the given currency is valid or not
const validCurrency = (currency) => {
    const validCurrency = ['usd', 'eur']
    return validCurrency.includes(currency)
}

// Will return Paid & UnPaid Fee of all appointments
const getFee = (appointments, requiredCurrency) => {
    const currencyConversion = {
        usd: 1.02, // Usd to eur
        eur: 0.98, // Eur to Usd
    }

    const fee = {}

    // Finding the sum of Unpaid Bills
    fee.unpaid = appointments.reduce((acc, appointment) => {
        if(!appointment.isPaid) {
            if(appointment.currency !== requiredCurrency) {
                acc =  acc + (appointment.fee * currencyConversion[appointment.currency])
            } else {
                acc = acc + appointment.fee
            }
        }
        return acc
    }, 0)

    // Finding the sum of paid Bills
    fee.paid = appointments.reduce((acc, appointment) => {
        if(appointment.isPaid) {
            if(appointment.currency !== requiredCurrency) {
                acc =  acc + (appointment.fee * currencyConversion[appointment.currency])
            } else {
                acc = acc + appointment.fee
            }
        }
        return acc
    }, 0)

    return fee
}

// Exports Here
module.exports.getTodayDate = getTodayDate
module.exports.getSecondDate = getSecondDate
module.exports.getStringDate = getStringDate
module.exports.getNumOfWeeks = getNumOfWeeks
module.exports.validCurrency = validCurrency
module.exports.getFee = getFee