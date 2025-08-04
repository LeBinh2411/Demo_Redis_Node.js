// Tạo 1 redis sử dụng thư viện ioredis
const Redis = require("ioredis");
//Tạo 1 redis mới đê kết nối
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

/*
  Stream là một trong những kiểu dữ liệu mạnh mẽ nhất, thích hợp cho các hệ thống
  xử lý dữ liệu theo thời gian thực
  - Stream là một kiểu dữ liệu dạng nhật ký(log) có thứ tự thời gian, cho phép
  + Ghi lại dòng sự kiện(event stream)
  + Đọc từng sự kiện theo thứ tự
  + Giao tiếp giữa các service theo mô hình Pub/Sub nhưng bền vững hơn
*/

async function demoStream(){

  //khởi tạo biến lưu key
  const streamKey = 'mystream';

  await redis.del(streamKey); // Xóa dữ liệu cũ

  // 1. xadd - Thêm sự kiện mới vào stream
  const id1 = await redis.xadd(streamKey, '*', 'user', 'user1', 'action', 'login');
  const id2 = await redis.xadd(streamKey, '*', 'user', 'user2', 'action', 'logout');
  const id3 = await redis.xadd(streamKey, '*', 'user', 'user3', 'action', 'login');
  const id4 = await redis.xadd(streamKey, '*', 'user', 'user4', 'action', 'login');
  const id5 = await redis.xadd(streamKey, '*', 'user', 'user5', 'action', 'logout');
  const id6 = await redis.xadd(streamKey, '*', 'user', 'user6', 'action', 'login');
  console.log('Đã thêm sự kiện vào stream với ID: ', id1, id2, id3, id4, id5, id6);

  // 2. xrange - Đọc dữ liệu theo khoảng ID, từ cũ đến mới(nếu đảo dấu sẽ bị trả về mảng rỗng)
  // '-' : là ID nhỏ nhất (từ đầu stream)
  // '+' : là ID lớn nhất (đến cuối stream)
  const events = await redis.xrange(streamKey, '-', '+');
  console.log('Tất cả sự kiện từ cũ đến mới: ', events);
  // // Đọc từ mới đến cũ (gần nhất trước) - chỉ lấy 2 sự kiện
  // const recent = await redis.xrevrange('mystream', '+', '-', 'COUNT', 2);
  events.forEach(([id, fields]) => {
    const data = {};
    for(let i =0; i< fields.length; i += 2){
      data[fields[i]] = fields[i + 1];
    }
    console.log('hi' ,`[${id}]`, data);
  });
  // 3. xrevrange - Đọc từ mới đến cũ(lấy bản ghi mới nhất trước)
  const eventsxre = await redis.xrevrange(streamKey, '+', '-');
  console.log('Tất cả sự kiện từ mới đến cũ: ', eventsxre);
  // // Đọc từ mới đến cũ (gần nhất trước) - chỉ lấy 5 sự kiện 
  // const recent = await redis.xrevrange('mystream', '+', '-', 'COUNT', 5);

  // hỗ trợ phần 4
  setTimeout(() => {
  console.log('==> Thêm log sau 2 giây...');
  redis.xadd(streamKey, '*', 'user', 'delayedUser', 'action', 'logout');
}, 2000); // thêm log sau 2 giây
  // 4. xread - Đọc dữ liệu mới nhất, kiểu real - time
  console.log('(Đang chờ sự kiện mới ...)');
  const result = await redis.xread(
    'BLOCK', 5000,   // Đợi tối đa 500ms nếu chưa có sự kiện mới
    'STREAMS', streamKey,
    '$' // chỉ đọc log mới sau id cuối cùng
  );
  console.log(result);
}
demoStream();