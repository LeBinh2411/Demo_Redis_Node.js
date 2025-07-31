// Tạo 1 redis sử dụng thư viện ioredis
const Redis = require('ioredis');
//Tạo 1 redis mới đê kết nối
const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

/* Set là tập hợp các phần tử duy nhất, không có phần tử trùng nhau
Dữ liệu trong Set không có thứ tự, nghĩa là thứ tự bạn thêm vào không quan trọng.
Rất thích hợp để
- Kiểm tra sự tồn tại (như danh sách email đã đăng ký, user đã vote…)
- Tính giao / hợp / hiệu của 2 tập.
*/

async function demoSet(){

    //Tạo 1 biến lưu key danh sách
    const key = 'mySet';

    // Xóa dữ liệu key mySet
    await redis.del(key);

    // 1. sadd - thêm phần tử
    await redis.sadd(key, 'apple', 'banana', 'orange');
    await redis.sadd(key, 'apple', 'heeee', 'hahaha', 'huhu', 'hihi');// bỏ qua phần tử đã tồn tại
    
    // 2. smembers - Lấy toàn bộ phần tử trong set
    const members = await redis.smembers(key);
    console.log('Danh sách của Set không đảm bảo thứ tự: ',members);

    // 3. sismember - Kiểm tra phần tử có tồn tại không
    const isExist = await redis.sismember(key, 'banana');
    console.log('Banana có tồn tại hay không: ', isExist === 1 ? 'true':'false');

    // 4. srem - Xóa phần tử khỏi Set
    const xoaOrange = await redis.srem(key, 'orange', 'hahaha');
    console.log('Số phần tử đã xóa: ' ,xoaOrange);

    // 5. scard - Đếm số phần tử trong Set
    const count = await redis.scard(key);
    console.log('Số phần tử trong meSet: ', count);

    // 6. spop - Xóa 1 phần tử ngẫu nhiên và trả về phần tử đó
    //Dùng khi muốn rút ngẫu nhiên phần tử rồi xử lý (ví dụ random gift).
    const randomRemoved = await redis.spop(key);
    console.log('Phần tử đã bị xóa ngẫu nhiên: ', randomRemoved);
    console.log('Danh sách hiện tại: ', await redis.smembers(key));

    // 7. srandmember - Lấy phần tử ngẫu nhiên (không xóa)
    const one = await redis.srandmember(key);
    console.log('Random 1 phần tử ngẫu nhiên: ', one);

    // 8. sdiff - Hiệu của 2 tập (A - B) - Lấy những pt khác nhau giữa 2 mảng set
    await redis.sadd('setA', 'a', 'b', 'c', 'd');
    await redis.sadd('setB', 'b', 'c');
    const diff = await redis.sdiff('setA', 'setB');
    console.log('A - B: ', diff);

    // 9. sinter - Giao nhau của 2 tập
    const inter = await redis.sinter('setA', 'setB');
    console.log('A Giao B : ', inter);

    // 10. sunion - Hợp nhất các tập
    const union = await redis.sunion('setA', 'setB');
    console.log('A + B: ', union);

     await redis.quit();
}
demoSet()

/* Danh sách bạn bè của user
💡 Tình huống:
- Mỗi user sẽ có một danh sách bạn bè. Mỗi người bạn là một userId.

✅ Dùng Set để làm gì?
- Dễ dàng kiểm tra 2 người có phải bạn bè không bằng SISMEMBER.

- Tìm bạn chung (mutual friends) giữa 2 người bằng SINTER.

// Thêm bạn
await redis.sadd('user:1:friends', '2', '3', '4');
await redis.sadd('user:2:friends', '3', '4', '5');

// Kiểm tra user 3 có là bạn của user 1 không?
await redis.sismember('user:1:friends', '3'); // => 1 (true)

// Tìm bạn chung giữa user 1 và 2
await redis.sinter('user:1:friends', 'user:2:friends'); // => ['3', '4']
*/

/*2. Người đã like một bài viết
💡 Tình huống:
- Mỗi bài viết cần lưu lại danh sách user đã like. Nhưng không ai được like 2 lần.

✅ Dùng Set để làm gì?
- Đảm bảo user chỉ like 1 lần nhờ tính chất không trùng lặp.

- Kiểm tra user đã like hay chưa bằng SISMEMBER.

await redis.sadd('post:123:likes', 'user1', 'user2');
await redis.sadd('post:123:likes', 'user2'); // Không thêm lại nữa

await redis.sismember('post:123:likes', 'user1'); // => 1
*/

/* 3. Lưu IP đã truy cập hệ thống
💡 Tình huống:
- Bạn muốn lưu danh sách các IP truy cập vào hệ thống để:

- Kiểm tra có phải IP lạ không

- Giới hạn số IP truy cập

- Phòng chống tấn công DDoS

✅ Dùng Set để làm gì?
- Lưu trữ các IP duy nhất.

- Đếm số IP khác nhau trong 1 ngày (SCARD).

- Dùng SISMEMBER để kiểm tra IP đã truy cập chưa.
await redis.sadd('access:ips:2025-07-29', '1.1.1.1', '2.2.2.2');
await redis.scard('access:ips:2025-07-29'); // => 2 IP

await redis.sismember('access:ips:2025-07-29', '1.1.1.1'); // => 1 (đã truy cập)

*/

/* 4. Tag phân loại sản phẩm
💡 Tình huống:
- Mỗi sản phẩm có thể có nhiều tag như "điện tử", "hàng mới", "giảm giá"…

✅ Dùng Set để làm gì?
- Dễ dàng gắn tag cho sản phẩm.

- Dễ dàng tìm sản phẩm theo tag.

- Dễ thực hiện tìm sản phẩm thuộc nhiều tag cùng lúc bằng SINTER.

// Gắn tag cho từng sản phẩm
await redis.sadd('tag:electronics', 'sp1', 'sp2');
await redis.sadd('tag:discount', 'sp2', 'sp3');

// Tìm sản phẩm vừa "electronics" vừa "discount"
await redis.sinter('tag:electronics', 'tag:discount'); // => ['sp2']
*/