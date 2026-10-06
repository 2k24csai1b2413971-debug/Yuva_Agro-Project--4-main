const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    village: {
        type: String,
        trim: true
    },

    crop: {
        type: String,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[6-9]\d{9}$/,
        select: false
    }
});

module.exports = mongoose.model('Farmer', farmerSchema);
