import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    if (!process.env.DB_CONNECT) {
      throw 'DB_CONNECT is not defined in .env file';
    } else {
      await mongoose.connect(process.env.DB_CONNECT, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log('Connected to database');
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
};
