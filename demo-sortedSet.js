// Tạo 1 redis sử dụng thư viện ioredis
const Redis = require('ioredis');
//Tạo 1 redis mới đê kết nối
const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

/* Sorted Set (ZSET) là 1 kiểu dữ liệu kết hợp giữa Hash và Set
Cực kỳ hữu ích cho các tính năng xếp hạng, ưu tiên, thống kê có sắp xếp
Tổng quan về Sorted Set
- Giống như Set: chứa các phần tử không trùng lặp
- Mỗi phần tử có thêm 1 score(điểm số) - một số thực dùng để sắp xếp phần tử
- Redis tự động sắp xếp theo score từ nhỏ đến lớn
*/

async function demoSortedSet(){

    // 1. zadd - Thêm phần tử vào sorted set 
    await redis.zadd('leaderboard', 100, 'userA');
    await redis.zadd('leaderboard', 200, 'userB');
    await redis.zadd('leaderboard', 300, 'userC');
    await redis.zadd('leaderboard', 150, 'userD');
    await redis.zadd('leaderboard', 50, 'userE');
    
    // 2. zrange - lấy dữ liệu  từ start đến stop theo thứ tự tăng dần(mặc dịnh không có score)
    const a = await redis.zrange('leaderboard', 0, -1);
    console.log(a);
    const b = await redis.zrange('leaderboard', 0, -1, 'WITHSCORES');
    console.log(b);

    // 3. zrevrange - lấy dữ liệu nhưng theo chiều giảm dần(score cao nhất trước)
    const c = await redis.zrevrange('leaderboard', 0 , -1, 'WITHSCORES');
    console.log(c);

    // 4. zscore - Lấy score (điểm số) của phần tử
    console.log('Điểm số của userA: ', await redis.zscore('leaderboard', 'userA'));

    // 5. zrank - trả về vị trí xếp hạng theo thứ tự tăng dần của phần tử
    console.log('Rank của userD: ', await redis.zrank('leaderboard', 'userD'));

    // zrevrank - trả về vị trí xếp hạng theo thứ tự giảm dần
    console.log('Rank của userD theo giảm dần: ', await redis.zrevrank('leaderboard', 'userD'));

    // 6. zincrby - Tăng điểm cho phần tử
    await redis.zincrby('leaderboard', 150, 'userA');

    // 7. zrem - Xóa phần tử 
    await redis.zrem('leaderboard', 'userE');

    console.log('Danh sách sau khi tăng điểm + xóa: ', await redis.zrevrange('leaderboard', 0, -1, 'WITHSCORES'));

    // 8. zcard - Trả về tổng số phần tử
    console.log('Tổng số phần tử trong leaderboard là: ', await redis.zcard('leaderboard'));

    // 9. zcount - Đếm số phần tử có score nằm trong khoảng [min, max]
    const soPt = await redis.zcount('leaderboard', 100, 250);
    console.log('Tổng số phần tử có trong khoảng là: ', soPt);

    // 10. zrangebyscore - Trả về phần tử có score nằm trong khoảng [min, max]
    const pt = await redis.zrangebyscore('leaderboard', 100, 250);
    console.log('Các phần tử nằm trong khoảng: ', pt);

    await redis.quit();// đóng kết nối Redis, giải phóng tài nguyên bộ nhớ Ram
}

demoSortedSet();

/* 1. Mục tiêu: Xếp hạng người chơi theo điểm số.
zadd: thêm người chơi với điểm số.

zrevrange: lấy người chơi theo điểm từ cao đến thấp.

🧠 Sorted Set rất phù hợp cho leaderboard vì tự động sắp xếp.
*/

/* 2. Lưu thời điểm truy cập (timestamp)
- ❓ Mục tiêu: Lưu log truy cập và dễ truy vấn theo thời gian.

const now = Date.now(); // timestamp hiện tại
await redis.zadd("access_logs", now, "ip:192.168.1.5");

// Truy vấn các truy cập trong 1 giờ qua
const oneHourAgo = now - 3600 * 1000;
const recentAccess = await redis.zrangebyscore("access_logs", oneHourAgo, now);

Giải thích:
- score là timestamp để có thể dễ dàng lọc theo thời gian.

- Truy vấn zrangebyscore cho phép lọc trong khoảng thời gian bất kỳ.
*/

/* 3. Ưu tiên xử lý task
- ❓ Mục tiêu: Ưu tiên xử lý các task theo độ khẩn cấp.
await redis.zadd("task_queue", 1, "send_email");
await redis.zadd("task_queue", 3, "resize_image");
await redis.zadd("task_queue", 2, "log_activity");

// Lấy task ưu tiên nhất
const nextTask = await redis.zrange("task_queue", 0, 0);

Giải thích:
- Score càng nhỏ => độ ưu tiên càng cao.

- Dễ dàng lấy task ưu tiên nhất bằng zrange.
*/

/* 4. Hệ thống đề xuất (Recommendation System)
- ❓ Mục tiêu: Gợi ý sản phẩm theo độ phù hợp (relevance score).
await redis.zadd("recommend:for:user123", 0.95, "product:101");
await redis.zadd("recommend:for:user123", 0.80, "product:102");
await redis.zadd("recommend:for:user123", 0.60, "product:103");

// Lấy top 2 sản phẩm được gợi ý tốt nhất
const suggested = await redis.zrevrange("recommend:for:user123", 0, 1);
Giải thích:
- Score đại diện cho mức độ phù hợp.

- zrevrange giúp lấy sản phẩm phù hợp nhất nhanh chóng.
*/

/* 5. Gợi ý tìm kiếm (Search Suggest)
- ❓ Mục tiêu: Gợi ý từ khóa được tìm nhiều nhất.
await redis.zincrby("search:suggestions", 1, "áo thun");
await redis.zincrby("search:suggestions", 1, "áo khoác");
await redis.zincrby("search:suggestions", 1, "áo sơ mi");

// Gợi ý top 2 từ khóa người dùng hay tìm
const popularSearches = await redis.zrevrange("search:suggestions", 0, 1);
Giải thích:
- Mỗi lần người dùng tìm, tăng score của từ khóa (zincrby).

- Dễ dàng trả ra top từ khóa được tìm nhiều nhất.*/