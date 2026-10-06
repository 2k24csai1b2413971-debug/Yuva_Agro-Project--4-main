const express = require('express');
const router = express.Router();
const { getFarmers, getFarmer, registerFarmer } = require('../controllers/farmerController');

router.get('/', getFarmers);        // GET  /api/farmers
router.get('/:id', getFarmer);      // GET  /api/farmers/5
router.post('/', registerFarmer);   // POST /api/farmers

module.exports = router;