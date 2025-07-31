// Tạo 1 redis sử dụng thư viện ioredis
const Redis = require("ioredis");
//Tạo 1 redis mới đê kết nối
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

/* ❗ Bitmap là kiểu dữ liệu dùng để thao tác với các bit (0 hoặc 1) trên chuỗi nhị phân
👉 Rất tiết kiệm bộ nhớ, thích hợp để:
  - Theo dõi trạng thái 1(hoạt động) / 0(không hoạt động) - true/false (đã đăng nhập, đã xem…)
  - Đếm số lượng bit = 1
  - So sánh dữ liệu bằng thao tác logic (OR, AND…)
*/

async function demoBitMap() {
  //tạo biến lưu key
  const key = "user:active:2025-07-29";

  // 1. Setbit - đánh dấu người dùng đã hoạt động
  // User có ID 1, 3, 5 đã hoạt động trong ngày
  await redis.setbit(key, 1, 1);
  await redis.setbit(key, 3, 1);
  await redis.setbit(key, 5, 1);
  console.log("Đã setbit cho user 1,3, 5");

  // 2. Getbit - Kiểm tra user có hoạt động không
  const user3 = await redis.getbit(key, 3);
  const user4 = await redis.getbit(key, 4);
  console.log(`User 3 có hoạt động không? ${user3 ? "Có" : "Không"}`);
  console.log(`User 4 có hoạt động không? ${user4 ? "Có" : "Không"}`);

  // 3. Bitcount - Đếm tổng số bit = 1(tức là số user hoạt động);
  const activeCount = await redis.bitcount(key);
  console.log(`Tổng số user hoạt động hôm nay: ${activeCount}`);

  // 4. Bitop - thao tác logic giữa nhiều bitmap
  // Giả sử có thêm key ngày hôm trước
  const keyYesterday = "user:active:2025-07-28";
  await redis.setbit(keyYesterday, 2, 1);
  await redis.setbit(keyYesterday, 3, 1);
  await redis.setbit(keyYesterday, 6, 1);

  //Tạo key mới chứa kết quả OR của 2 ngày
  await redis.bitop("OR", "user:active:2day", key, keyYesterday);

  // 4.1. Get từng bit kết quả OR(người đăng nhập ít nhất 1 ngày)
  // OR - Chỉ cần 1 trong 2 ngày hoạt động thì kết quả của OR = 1
  const allUsers = [];
  for (let i = 0; i <= 6; i++) {
    const bit = await redis.getbit("user:active:2day", i);
    allUsers.push({ userId: i, active: bit });
  }
  console.log("Tình trạng hoạt động từng user trong 2 ngày: ", allUsers);
  // 5555. Bitcount - đếm user có bit = 1;
  const total = await redis.bitcount("user:active:2day");
  console.log(`Tổng user hoạt động trong 2 ngày qua: ${total}`);

  // 4.2. AND - Người đăng nhập cả 2 ngày
  // user phải đăng nhập cả 2 ngày thì kết quả AND = 1
  await redis.bitop("AND", "login:both_day", key, keyYesterday);
  console.log("Cả 2 ngày: ");
  for (let i = 0; i <= 6; i++) {
    const bit = await redis.getbit("login:both_day", i);
    console.log(`user ${i}: ${bit}`);
  }
  const totalBotDays = await redis.bitcount("login:both_day");
  console.log(`Số user hoạt động cả 2 ngày: ${totalBotDays}`);

  //4.3. XOR - Nếu chỉ đăng nhập 1 trong 2 ngày hoạt động thì kết quả XOR =1
  // Nhưng nếu cả 2 ngày bằng nhau(0 - 0 hoặc 1 - 1) thì kết quả XOR = 0
  await redis.bitop('XOR', 'login:one_day_only', key, keyYesterday);
  for(let i=0; i<= 6; i++){
    const bit = await redis.getbit('login:one_day_only', i);
    console.log(`user ${i}: ${bit}`);
  }
  const totalXor = await redis.bitcount('login:one_day_only');
  console.log(`Số user hoạt động chỉ 1 trong 2 ngày: ${totalXor}`);


  //4.4. NOT - Không đăng nhập 1 ngày, chỉ áp dụng cho 1 chuỗi duy nhất
  // NOT sẽ đảo bit: 1 → 0, 0 → 1

  //Redis tạo 1 bitmap mới tên login:not_day1 và đảo bít từng vị trí của key
  // Rồi dùng bitcount để đếm những user không hoạt động vì bitcount chỉ đếm bit =1
  // nên phải dùng not để đổi 0 => 1 
  await redis.bitop('NOT', 'login:not_day1', key);
  for (let i = 0; i <= 6; i++) {
    const bit = await redis.getbit('login:not_day1', i);
    console.log(`user ${i}: ${bit}`); // 0 trở thành 1, 1 trở thành 0
  }
  const totolNot = await redis.bitcount('login:not_day1');
  console.log(`Tổng số user không hoạt động trong ngày 29: ${totolNot}`);

  await redis.quit();
}
demoBitMap();

