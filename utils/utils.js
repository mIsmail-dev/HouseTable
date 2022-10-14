const getTodayDate = () => {
    let today = new Date()
    const dd = String(today.getDate() + 1).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear()
    today = mm + '-' + dd + '-' + yyyy;
    return new Date(today)
}

const getSecondDate = (numOfWeeks, todayDate) => {
    let secondDate = new Date()
    secondDate.setDate(todayDate.getDate() - numOfWeeks * 7)
    return secondDate
}

const getStringDate = (today) => {
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()
    today = mm + '-' + dd + '-' + yyyy;
    return today
}

const getNumOfWeeks = (period) => {
    if(period === "weekly") {
        return 1
    } else if(period === "monthly") {
        return 4
    } else {
        return 12
    }
}

const validCurrency = (currency) => {
    const validCurrency = ['usd', 'eur']
    return validCurrency.includes(currency)
}

const sumFee = (appointments, isPaid) => {
    const total = appointments.reduce((sum, appointment) => {
        if (appointment.isPaid === isPaid) {
          sum = sum + appointment.fee;
        }
        return sum;
      }, 0);
    return total
}

const getFee = (appointments, requiredCurrency) => {
    const currencyConversion = {
        usd: 1.02, // Usd to eur
        eur: 0.98, // Eur to Usd
    }

    const fee = {}
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

const getPopularPet = (patients) => {
    let max = 0;
    const popularPet = patients.reduce((acc, patient) => {
    if (patient.appointments.length > max) {
      max = patient.appointments.length;
      acc.id = patient._id;
      acc.name = patient.name;
      acc.totalAppointments = max;
    }
    return acc;
  }, {});

  return popularPet
}

const getEveryPetDetails = (patients) => {
    const petsDetail = patients.reduce((acc, patient) => {
        const petDetail = {};
        petDetail.id = patient._id;
        petDetail.name = patient.name;
        petDetail.totalFeePaid = sumFee(patient.appointments, true)
        petDetail.totalFeeUnPaid = sumFee(patient.appointments, false)
    
        acc.push(petDetail);
        return acc;
      }, []);

      return petsDetail
}

// Exports Here
module.exports.getTodayDate = getTodayDate
module.exports.getSecondDate = getSecondDate
module.exports.getStringDate = getStringDate
module.exports.getNumOfWeeks = getNumOfWeeks
module.exports.validCurrency = validCurrency
module.exports.getFee = getFee
module.exports.getPopularPet = getPopularPet
module.exports.getEveryPetDetails = getEveryPetDetails