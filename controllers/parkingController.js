const axios = require('axios');
const cheerio = require('cheerio');
const ParkingLot = require('../models/parkingLot');

exports.scrapeParkingData = async function() {
    try {
        const lots = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        for (const day of days) {
            const response = await axios.get('https://www.lsu.edu/parking/availability.php', {
                params: { day: day.toLowerCase() },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'text/html'
                }
            });
            
            const $ = cheerio.load(response.data);
            
            $('table tbody tr').each((i, row) => {
                const columns = $(row).find('td');
                if (columns.length < 7) return;

                const lot = {
                    name: $(columns[0]).text().trim(),
                    lotNumber: $(columns[1]).text().trim(),
                    totalSpaces: parseInt($(columns[2]).text().trim()) || 0,
                    timeSlots: {
                        sevenAM: parseInt($(columns[3]).text().replace(/\D/g, '')) || 0,
                        elevenAM: parseInt($(columns[4]).text().replace(/\D/g, '')) || 0,
                        twoPM: parseInt($(columns[5]).text().replace(/\D/g, '')) || 0,
                        fourPM: parseInt($(columns[6]).text().replace(/\D/g, '')) || 0
                    },
                    lastUpdated: new Date(),
                    dayOfWeek: day
                };

                if (lot.name) {
                    lots.push(lot);
                }
            });

            // Add some delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (lots.length > 0) {
            await ParkingLot.deleteMany({});
            await ParkingLot.insertMany(lots);
        }

        return lots;
    } catch (error) {
        console.error('Scraping error:', error);
        return [];
    }
};
exports.getAllLots = async (req, res) => {
    try {
        const lots = await ParkingLot.find({});
        res.render('availability', { lots });
    } catch (error) {
        console.error('Error getting lots:', error);
        res.render('error', { message: 'Error loading parking data' });
    }
};

exports.getAdminPage = async (req, res) => {
    try {
        const lots = await ParkingLot.find({});
        res.render('admin', { lots });
    } catch (error) {
        console.error('Error loading admin page:', error);
        res.render('error', { message: 'Error loading admin page' });
    }
};

exports.addLot = async (req, res) => {
    try {
        const lot = new ParkingLot({
            name: req.body.name,
            lotNumber: req.body.lotNumber,
            totalSpaces: req.body.totalSpaces,
            timeSlots: {
                sevenAM: req.body.timeSlots.sevenAM,
                elevenAM: req.body.timeSlots.elevenAM,
                twoPM: req.body.timeSlots.twoPM,
                fourPM: req.body.timeSlots.fourPM
            },
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

exports.deleteLot = async (req, res) => {
    try {
        await ParkingLot.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting lot:', error);
        res.render('error', { message: 'Error deleting parking lot' });
    }
};