

//tạo 1 redis sử dụng thư viện ioredis
const Redis = require('ioredis');

//Tạo 1 redis mới để kết nối
const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

/*Hash trong Redis là một tập hợp các cặp firld-value, dùng để lưu trữ đối tượng
dạng JSON nhưng không phải là JSON thật sự vì không có cấu trúc lồng nhau như JSON.*/

async function run(){

    // 1. hset - Thêm dữ liệu vào hash
    await redis.hset('user:1', 'name','Alice', 'age', '25', 'hi', 'Haivl', 'ha','hav1');
    console.log('✅ Đã tạo hash user:1');

    // 2. hget - Lấy 1 field
    const name = await redis.hget('user:1', 'name');
    console.log('👤 Tên của user:1 là:', name);

    // 3. hgetall - Lấy toàn bộ hash
    const user = await redis.hgetall('user:1');
    console.log('📦 Dữ liệu đầy đủ của user:1:', user);

    // 4. hexists - Kiểm tra field(trường dữ liệu) có tồn tại không
    const hasEmail = await redis.hexists('user:1', 'email');
    console.log('🔍 Có field email không?', hasEmail === 1 ? 'True' : 'False');

    // 5. hdel - Xóa 1 field(trường dữ liệu)
    await redis.hdel('user:1', 'age');
    console.log('🗑️ Đã xóa field age khỏi user:1');
    console.log('field age có tồn tại không ? ', (await redis.hexists('user:1', 'age'))=== 1 ? 'Có' : 'Không');

    // 6. hlen - Đếm số lượng field
    const lenght1 = await redis.hlen('user:1');
    console.log('📏 Số lượng field còn lại:', lenght1);

    // 7. hkeys / hvals - Lấy danh sách field / vlues
    const fields = await redis.hkeys('user:1');
    const values = await redis.hvals('user:1');
    console.log('🗝️ Các field:', fields);
    console.log('📄 Các value:', values);

    await redis.quit();
}

run();

/* 2. Redis Hash — lợi ích và ứng dụng thực tế
Hash gần giống object trong JavaScript, nên rất tiện để lưu dữ liệu có cấu trúc.

🔹 Lợi ích:
Tiết kiệm bộ nhớ hơn String khi lưu nhiều thuộc tính của cùng 1 đối tượng.

Có thể cập nhật từng field mà không ảnh hưởng toàn bộ object.

Nhanh chóng khi truy cập từng thuộc tính.

🔸 Ứng dụng thực tế:
✅ Lưu thông tin người dùng (user:123 → {name: "Bình", age: 22})

✅ Lưu thông tin sản phẩm (product:456 → {name: "Áo thun", stock: 12})

✅ Lưu metadata nhanh gọn mà không cần join nhiều bảng

✅ Session Storage hoặc cấu hình tạm thời cho user

*/