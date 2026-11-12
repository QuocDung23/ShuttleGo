// Tạo dữ liệu mẫu: 1 chủ sân, 1 người chơi, 2 cơ sở. Chạy: npm run db:seed
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, q, q1 } from '../src/config/db';

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  const owner = await q1(`INSERT INTO users (full_name,email,phone,password_hash,role) VALUES ('Chủ sân Minh','owner@shuttlego.vn','0901000001',$1,'OWNER')
    ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id`, [hash]);
  await q(`INSERT INTO users (full_name,email,phone,password_hash) VALUES ('Người chơi An','player@shuttlego.vn','0901000002',$1)
    ON CONFLICT (email) DO NOTHING`, [hash]);

  const venues = [
    { name: 'Sân cầu lông Phú Thọ', address: '1 Lữ Gia, Phường 15', district: 'Quận 11', lat: 10.7676, lng: 106.6573, courts: 4, am: ['PARKING', 'DRINKS', 'LOCKER'] },
    { name: 'ShuttleGO Thủ Đức', address: '12 Võ Văn Ngân', district: 'TP Thủ Đức', lat: 10.8506, lng: 106.7718, courts: 3, am: ['PARKING', 'AC'] },
  ];
  for (const v of venues) {
    const exists = await q1('SELECT id FROM venues WHERE name=$1', [v.name]);
    if (exists) continue;
    const row = await q1(`INSERT INTO venues (owner_id,name,address,district,latitude,longitude,phone,open_time,close_time)
      VALUES ($1,$2,$3,$4,$5,$6,'0901000001','06:00','22:00') RETURNING id`, [owner.id, v.name, v.address, v.district, v.lat, v.lng]);
    for (let i = 1; i <= v.courts; i++) await q('INSERT INTO courts (venue_id,name) VALUES ($1,$2)', [row.id, `Sân ${i}`]);
    await q(`INSERT INTO price_rules (venue_id,day_type,start_time,end_time,price_per_slot) VALUES
      ($1,'WEEKDAY','06:00','17:00',60000), ($1,'WEEKDAY','17:00','22:00',90000), ($1,'WEEKEND','06:00','22:00',100000)`, [row.id]);
    await q('INSERT INTO venue_amenities SELECT $1,id FROM amenities WHERE code = ANY($2)', [row.id, v.am]);
  }
  console.log('Seed xong. Tài khoản: owner@shuttlego.vn / player@shuttlego.vn, mật khẩu 123456');
  await pool.end();
}
main();
