import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ITJOBS', {
      dbName: 'ITJOBS', // đảm bảo mongoose dùng đúng DB
    });

    console.log('⚡ MongoDB Connected to ITJOBS');
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  }
};
