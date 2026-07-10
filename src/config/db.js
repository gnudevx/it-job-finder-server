import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'ITJOBS',
    });

    console.log(`⚡ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  }
};
