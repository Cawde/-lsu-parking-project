const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: String,
  availability: Number,
  lastUpdated: Date,
  dayOfWeek: String
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);