const mongoose = require('mongoose');

const connectDb = async (DB_STRING) => {
  try {
    await mongoose.connect(DB_STRING, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected.');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Retrying...');
      handleDbReconnect(DB_STRING);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

  } catch (err) {
    console.error(`Initial MongoDB connection failed: ${err.message}`);
    handleDbReconnect(DB_STRING);
  }
};

const handleDbReconnect = async (DB_STRING) => {
  let retries = 0;
  while (retries < 5) {
    try {
      console.log(`Retrying MongoDB connection... Attempt ${retries + 1}`);
      await mongoose.connect(DB_STRING);
      console.log('MongoDB reconnected.');
      break;
    } catch (err) {
      retries++;
      console.error(`Reconnection failed: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * retries));
    }
  }
};


module.exports = connectDb;