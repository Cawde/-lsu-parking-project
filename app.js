const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const { scrapeParkingData } = require('./controllers/parkingController');
const app = express();

// Middleware setup //
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with initial data scraping //
mongoose.connect('mongodb://127.0.0.1:27017/lsu_parking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  console.log('Database:', mongoose.connection.name);
  
  try {
    console.log('Performing initial data scrape...');
    const lots = await scrapeParkingData();
    console.log('Scraped data:', lots);
  } catch (error) {
    console.error('Error during data scrape:', error);
  }
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes //
app.use('/', routes);

// Error handler //
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;