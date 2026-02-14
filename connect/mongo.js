const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let listenersBound = false;

module.exports = ({ uri }) => {
  if (!uri) throw new Error('MongoDB URI is required');

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return mongoose.connection;
  }

  if (!listenersBound) {
    listenersBound = true;

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      console.log(`MongoDB connection error: ${err.message || err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.once('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed on app termination');
      } finally {
        process.exit(0);
      }
    });
  }

  mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    })
    .catch((err) => {
      console.log(`MongoDB initial connect failed: ${err.message || err}`);
    });

  return mongoose.connection;
};
