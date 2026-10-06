const mongoose = require('mongoose');

let connected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('MONGO_URI is not set in backend/.env — farmer features will be unavailable.');
    return;
  }

  try {
    await mongoose.connect(uri);
    connected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    // Deliberately NOT exiting the process. If MongoDB is unavailable we still
    // want the chatbot and disease detection to work.
    console.error('MongoDB connection failed:', error.message);
    console.error('Farmer registration will not work until MongoDB is running.');
  }
};

connectDB.isConnected = () => connected && mongoose.connection.readyState === 1;

module.exports = connectDB;
