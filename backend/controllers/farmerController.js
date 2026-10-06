const Farmer = require('../models/Farmer');
const connectDB = require('../config/db');

function requireDB(res) {
    if (!connectDB.isConnected()) {
        res.status(503).json({
            message: 'Database is not connected. Start MongoDB and restart the server.'
        });
        return false;
    }

    return true;
}


function getFarmers(req, res) {
    return res.status(403).json({
        message: 'Access denied. Farmer details are private.'
    });
}


function getFarmer(req, res) {
    return res.status(403).json({
        message: 'Access denied. Farmer details are private.'
    });
}

function registerFarmer(req, res) {
    if (!requireDB(res)) return;

    let { name, village, crop, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({
            message: 'Name and phone are required'
        });
    }

    phone = phone.trim();

    Farmer.findOne({ phone })
        .then(existingFarmer => {

            if (existingFarmer) {
                return res.status(409).json({
                    message: 'Phone number already registered'
                });
            }

            const farmer = new Farmer({
                name,
                village,
                crop,
                phone
            });

            return farmer.save();
        })
        .then(newFarmer => {

            
            if (!newFarmer) return;

            return res.status(201).json({
                message: 'Farmer registered successfully'
            });
        })
        .catch(error => {

            
            if (error.code === 11000) {
                return res.status(409).json({
                    message: 'Phone number already registered'
                });
            }

            // Mongoose validation error
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: error.message
                });
            }

            console.error('Farmer registration error:', error);

            return res.status(500).json({
                message: 'Server error while registering farmer'
            });
        });
}

module.exports = {
    getFarmers,
    getFarmer,
    registerFarmer
};
