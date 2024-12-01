// controllers/parkingController.js
const axios = require('axios');
const cheerio = require('cheerio');
const ParkingLot = require('../models/parkingLot');

async function scrapeParkingData() {
    try {
        const response = await axios.get('https://www.lsu.edu/parking/availability.php');
        const $ = cheerio.load(response.data);
        const lots = [];

        // Select all table rows except header
        $('table tr:not(:first-child)').each((i, element) => {
            const columns = $(element).find('td');
            const name = $(columns[0]).text().trim();
            const availability = parseInt($(columns[1]).text());
            
            if (name && !isNaN(availability)) {
                lots.push({
                    name: name,
                    availability: availability,
                    lastUpdated: new Date(),
                    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
                });
            }
        });
        
        return lots;
    } catch (error) {
        console.error('Scraping error:', error);
        return [];
    }
}

exports.syncParkingData = async (req, res) => {
    try {
        const lots = await scrapeParkingData();
        try {
            await ParkingLot.deleteMany({});
            await ParkingLot.insertMany(lots);
            res.redirect('/availability');
        } catch (dbError) {
            console.error('Database operation failed:', dbError);
            res.render('error', { message: 'Failed to update parking data' });
        }
    } catch (error) {
        console.error('Scraping error:', error);
        res.render('error', { message: 'Failed to fetch parking data' });
    }
};

exports.getAllLots = async (req, res) => {
    const lots = await ParkingLot.find({});
    res.render('availability', { lots });
};

exports.getAdminPage = async (req, res) => {
    const lots = await ParkingLot.find({});
    res.render('admin', { lots });
};

exports.addLot = async (req, res) => {
    const lot = new ParkingLot(req.body);
    await lot.save();
    res.redirect('/admin');
};

exports.deleteLot = async (req, res) => {
    await ParkingLot.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
};