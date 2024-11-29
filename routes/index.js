const express = require('express');
const router = express.Router();
const ParkingLot = require('../models/parkingLot');
const parkingController = require('../controllers/parkingController');

router.get('/', async (req, res) => {
    res.render('index');
});

router.get('/availability', async (req, res) => {
    const lots = await ParkingLot.find({});
    res.render('availability', { lots });
});

router.get('/admin', async (req, res) => {
    const lots = await ParkingLot.find({});
    res.render('admin', { lots });
});

router.get('/sync', parkingController.syncParkingData);

module.exports = router;