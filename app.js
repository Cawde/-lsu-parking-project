const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const { scrapeParkingData } = require('./controllers/parkingController');
const ParkingLot = require('./models/parkingLot');
const app = express();

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/lsu_parking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    const lots = await scrapeParkingData();
    await ParkingLot.deleteMany({});
    await ParkingLot.insertMany(lots);
    console.log('Initial parking data synced');
  } catch (error) {
    console.error('Initial sync failed:', error);
  }
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Auto-sync every 5 minutes?
setInterval(async () => {
  try {
    const lots = await scrapeParkingData();
    await ParkingLot.deleteMany({});
    await ParkingLot.insertMany(lots);
    console.log('Parking data auto-synced');
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}, 5 * 60 * 1000);

app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});