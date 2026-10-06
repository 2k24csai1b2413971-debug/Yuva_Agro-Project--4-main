const KVK = require('../models/KVK');
const connectDB = require('../config/db');

// Check whether MongoDB is connected
function requireDB(res) {
    if (!connectDB.isConnected()) {
        res.status(503).json({
            message: 'Database is not connected. Start MongoDB and restart the server.'
        });
        return false;
    }

    return true;
}

// GET /api/kvks
// Get all KVKs
function getKVKs(req, res) {
    if (!requireDB(res)) return;

    KVK.find()
        .sort({ state: 1, district: 1 })
        .then(kvks => {
            res.json(kvks);
        })
        .catch(error => {
            res.status(500).json({
                message: error.message
            });
        });
}


// GET /api/kvks/state/:state
// Get KVKs belonging to a particular state
function getKVKsByState(req, res) {
    if (!requireDB(res)) return;

    KVK.find({
        state: {
            $regex: `^${req.params.state}$`,
            $options: 'i'
        }
    })
        .sort({ district: 1 })
        .then(kvks => {
            res.json(kvks);
        })
        .catch(error => {
            res.status(500).json({
                message: error.message
            });
        });
}


// GET /api/kvks/district/:district
// Get KVKs belonging to a particular district
function getKVKsByDistrict(req, res) {
    if (!requireDB(res)) return;

    KVK.find({
        district: {
            $regex: `^${req.params.district}$`,
            $options: 'i'
        }
    })
        .then(kvks => {
            res.json(kvks);
        })
        .catch(error => {
            res.status(500).json({
                message: error.message
            });
        });
}


// GET /api/kvks/:code
// Get one specific KVK using its unique code
function getKVK(req, res) {
    if (!requireDB(res)) return;

    KVK.findOne({
        code: req.params.code
    })
        .then(kvk => {
            if (!kvk) {
                return res.status(404).json({
                    message: 'KVK not found'
                });
            }

            res.json(kvk);
        })
        .catch(error => {
            res.status(500).json({
                message: error.message
            });
        });
}


module.exports = {
    getKVKs,
    getKVKsByState,
    getKVKsByDistrict,
    getKVK
};
