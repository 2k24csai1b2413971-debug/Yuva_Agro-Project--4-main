const express = require('express');

const {
    getKVKs,
    getKVKsByState,
    getKVKsByDistrict,
    getKVK
} = require('../controllers/kvkController');

const router = express.Router();

// Get all KVKs
router.get('/', getKVKs);

// Get KVKs by state
router.get('/state/:state', getKVKsByState);

// Get KVKs by district
router.get('/district/:district', getKVKsByDistrict);

// Get one KVK by unique code
router.get('/:code', getKVK);

module.exports = router;
