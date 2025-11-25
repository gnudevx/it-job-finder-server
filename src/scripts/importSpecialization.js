import mongoose from 'mongoose';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// 1. Import Model (Lưu ý: Phải có đuôi .js ở cuối trong ESM)
import Specialization from '../models/specialization.model.js';

// 2. Thiết lập đường dẫn để đọc file JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Đọc dữ liệu từ file JSON
const dataPath = path.join(__dirname, './specializations.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const seedDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ITJOBS');
    console.log('🔌 Đã kết nối MongoDB');

    // Xóa dữ liệu cũ
    await Specialization.deleteMany({});

    // Thêm dữ liệu mới
    await Specialization.insertMany(data);
    console.log(`✅ Đã import thành công ${data.length} bản ghi!`);
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedDB();
