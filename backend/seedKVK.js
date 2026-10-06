require('dotenv').config();

const connectDB = require('./config/db');
const KVK = require('./models/KVK');
const kvks = require('./data/kvks');

async function seedKVKs() {
    try {
        await connectDB();

        console.log('Connected to MongoDB');

        // Remove existing KVK records
        await KVK.deleteMany({});

        // Insert verified KVK data
        await KVK.insertMany(kvks);

        console.log(`${kvks.length} KVK records inserted successfully`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding KVK data:', error);
        process.exit(1);
    }
}

seedKVKs();
