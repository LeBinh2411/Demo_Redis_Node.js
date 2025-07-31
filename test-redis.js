//Mục đích của file này
//Kết nối JavaScript tới Redis
//Redis hiện tại đang chạy trên Docker


// 1. Import thư viện Redis(ioredis)
//Gọi thư viện ioredis để dùng Redis trong Node.js.
const Redis = require('ioredis');

// 2. Tạo client Redis từ Node.js để kết nối Redis server tại host và port
const redis = new Redis({
    host: '127.0.0.1', //Redis đang chạy ở địa chỉ (localhost)
    port: 6379 // Cổng mặc định Redis, đã mở qua Docker, cần thông qua cổng này mới sử dụng được redis
});

// 3. Gửi một lệnh test để đảm bảo kết nối oke
redis.set('myKey', 'Hello Redis!')
    .then(() => {
        return redis.get('myKey'); //Lấy giá trị đã lưu
    })
    .then((result) => {
        console.log('Giá trị lấy được từ Redis: '+ result);
        redis.disconnect(); // Đóng kết nối Redis
    })
    .catch((err) =>{
        console.error('Lỗi kết nối hoặc thao tác Redis: ', err);
    });

