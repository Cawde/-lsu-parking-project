const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/availability', parkingController.getAllLots);

router.get('/admin', parkingController.getAdminPage);

router.post('/admin/add', parkingController.addLot);
router.post('/admin/delete/:id', parkingController.deleteLot);

module.exports = router;