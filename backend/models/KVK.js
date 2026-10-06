const mongoose = require('mongoose');

const kvkSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    state: {
        type: String,
        required: true,
        trim: true
    },

    district: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    hostOrganization: {
        type: String,
        required: true,
        trim: true
    },

    yearOfSanction: {
        type: Number
    },

    officialSource: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('KVK', kvkSchema);
