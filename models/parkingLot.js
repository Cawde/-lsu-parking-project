const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
    name: String,
    lotNumber: String,
    totalSpaces: Number,
    timeSlots: {
        sevenAM: Number,
        elevenAM: Number,
        twoPM: Number,
        fourPM: Number
    },
    lastUpdated: Date,
    dayOfWeek: String
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);