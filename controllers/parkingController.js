const axios = require('axios');
const cheerio = require('cheerio');
const ParkingLot = require('../models/parkingLot');

// Scraping function
exports.scrapeParkingData = async function() {
    try {
        console.log('Starting to scrape data...');
        const response = await axios.get('https://www.lsu.edu/parking/availability.php');
        const $ = cheerio.load(response.data);
        const lots = [];

        $('table tbody tr').each((i, element) => {
            const columns = $(element).find('td');
            const name = $(columns[0]).text().trim();
            const availability = parseInt($(columns[1]).text().replace('%', ''));
            
            console.log('Found lot:', { name, availability });

            if (name && !isNaN(availability)) {
                lots.push({
                    name: name,
                    availability: availability,
                    lastUpdated: new Date(),
                    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
                });
            }
        });
        
        console.log(`Scraped ${lots.length} lots`);
        
        // Save to database
        if (lots.length > 0) {
            await ParkingLot.deleteMany({});  // Clear existing data
            const savedLots = await ParkingLot.insertMany(lots);
            console.log(`Saved ${savedLots.length} lots to database`);
        }

        return lots;
    } catch (error) {
        console.error('Scraping/saving error:', error);
        return [];
    }
};

// Get all lots for availability page
exports.getAllLots = async (req, res) => {
    try {
        const lots = await ParkingLot.find({});
        res.render('availability', { lots });
    } catch (error) {
        console.error('Error getting lots:', error);
        res.render('error', { message: 'Error loading parking data' });
    }
};

// Get admin page
exports.getAdminPage = async (req, res) => {
    try {
        const lots = await ParkingLot.find({});
        res.render('admin', { lots });
    } catch (error) {
        console.error('Error loading admin page:', error);
        res.render('error', { message: 'Error loading admin page' });
    }
};

// Add new lot
exports.addLot = async (req, res) => {
    try {
        const lot = new ParkingLot({
            name: req.body.name,
            availability: req.body.availability,
            lastUpdated: new Date(),
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        });
        await lot.save();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding lot:', error);
        res.render('error', { message: 'Error adding parking lot' });
    }
};

// Delete lot
exports.deleteLot = async (req, res) => {
    try {
        await ParkingLot.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting lot:', error);
        res.render('error', { message: 'Error deleting parking lot' });
    }
};