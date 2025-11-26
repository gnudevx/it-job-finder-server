import mongoose from 'mongoose';
import Location from '../models/location.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
async function run() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    await mongoose.connect('mongodb://localhost:27017/ITJOBS');
    console.log('Kết nối MongoDB thành công');

    const raw = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'dvhcvn.json'), 'utf8'),
    );
    console.log('Đọc JSON thành công');

    let items = [];

    raw.data.forEach((province) => {
      items.push({
        code: province.level1_id,
        name: province.name,
        type: 'province',
        parent_code: null,
      });

      if (province.level2s) {
        province.level2s.forEach((d) => {
          items.push({
            code: d.level2_id,
            name: d.name,
            type: 'district',
            parent_code: province.level1_id,
          });

          if (d.level3s) {
            d.level3s.forEach((w) => {
              items.push({
                code: w.level3_id,
                name: w.name,
                type: 'ward',
                parent_code: d.level2_id,
              });
            });
          }
        });
      }
    });

    await Location.insertMany(items);
    console.log('Import thành công!', items.length, 'document(s)');
  } catch (err) {
    console.error('Lỗi xảy ra:', err);
  } finally {
    mongoose.disconnect();
  }
}

run();
