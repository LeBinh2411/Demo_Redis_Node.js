//import thư viện
const Redis = require("ioredis");
const redis = new Redis();

/*
❗ HyperLogLog là kiểu dữ liệu dùng để đếm số lượng phần tử khác nhau (duy nhất) trong một tập hợp mà không cần lưu toàn bộ dữ liệu.
👉 Ưu điểm: Tốn rất ít bộ nhớ (chỉ khoảng 12 KB), dù cho bạn thêm hàng triệu phần tử.
*/

async function demoHyperloglog() {
  // tạo key
  const key = "unique:visitors:2025-07-31";

  // 1. pfadd - Thêm phần tử vào key
  await redis.pfadd(key, "user1");
  await redis.pfadd(key, "user2");
  await redis.pfadd(key, "user3");
  await redis.pfadd(key, "user2"); // user2 đã có – sẽ không tăng thêm
  await redis.pfadd(key, "user4", "user5", "user6"); // thêm nhiều user cùng lúc

  console.log("Đã thêm danh sách user vào Hyperloglog");

  // 2. pfcount - đếm số lượng user duy nhất
  const count = await redis.pfcount(key);
  console.log(`Số lượng user duy nhất truy cập hôm nay: ${count}`);

  // 3. Kết hợp nhiều HyperLogLog với pfmerge
  const keyDay1 = "unique:visitors:2025-07-30";
  const keyDay2 = "unique:visitors:2025-07-29";
  await redis.pfadd(keyDay1, "user7", "user8", "user3");
  await redis.pfadd(keyDay2, "user9", "user10", "user1");

  //Gộp dữ liệu từ 3 ngày vào 1 key mới - pfmerge
  const keyMerged = 'unique:visitors:3days';
  await redis.pfmerge(keyMerged, key, keyDay1, keyDay2);

  const total3Days = await redis.pfcount(keyMerged);
  console.log(`Số user duy nhất trong 3 ngày qua: ${total3Days}`);
  
}
demoHyperloglog();
