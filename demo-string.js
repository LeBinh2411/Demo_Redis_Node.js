const { clearInterval } = require('timers');
//Redis String là kiểu dữ liệu dùng để lưu trữ chuỗi văn bản, số, hoặc JSON string
//Redis hoạt động như một key-value store

//Redis sẽ tự hiểu kiểu dữ liệu dựa vào lệnh bạn gọi
// VD: SET, GET ==> Redis tự hiểu là kiểu dữ liệu String

//import thư viện
const Redis = require('ioredis');


//Khởi tạo 1 Redis để sử dụng được các lệnh set, get, .....
const redis = new Redis({
    host: 'localhost',
    port: 6379,
}); //Kết nối mặc định 127.0.0.1:6379


async function run(){
    // 1. SET - tạo key và lưu giá trị, hoặc cập nhật 1 key trong Redis
    await redis.set('name', 'Bình');
    console.log('Đã lưu key "name"');

    await redis.set('name', 'Lê Bình');

    // 2. GET - lấy giá trị theo key
    const name = await redis.get('name');
    console.log('Giá trị của "name" là: ', name);

    // 3. INCR / DECR - Tự động tăng giảm 1
    // còn decrby thì sẽ giúp tăng, giảm nhiều
    await redis.set('count', 10);
    await redis.incr('count'); // tăng 1
    const countAfterIncr = await redis.get('count');
    console.log('Giá trị sau khi tăng: ', countAfterIncr);

    await redis.decrby('count', 5); //giảm 5
    const countAfterDecr = await redis.get('count');
    console.log('Giá trị sau khi giảm: ', countAfterDecr);

    // 4. APPEND - dùng để nối thêm nội dung vào chuỗi của key hiện tại
    await redis.del('greeting'); //Xóa key cũ nếu có

    //Gán giá trị ban đầu
    await redis.set('greeting', 'Xin chào');
    console.log('Ban đầu: ', await redis.get('greeting')); // Xin chào

    //Append nối thêm nội dung
    await redis.append('greeting', ', mình là Redis!');
    console.log('Sau append:', await redis.get('greeting')); //Xin chào, mình là Redis!

    // 5. EXPIRE - thiết lập thời gian sống (TTL) cho 1 key trong Redis. Sau khi hết thời gian này, Redis sẽ tự động xóa key
    /* EXPIRE thường dùng để
    Lưu token xác thực có hạn sử dụng
    Lưu OTP tạm thời
    Caching dữ liệu ngắn hạn
    Giới hạn truy cập (rate-limit)
    */

    //Tạo 1 key otp - giá trị 123456
    // await redis.set('otp', '123456'); 
    // await redis.expire('otp', 60); //Tự xóa sau 60s

    //Hoặc gộp lại: ex viết tắt của expire đặt thời gian sồng và tính bằng giây
    await redis.set('otp', '123456', 'EX', 20);
    console.log('Mã otp là: ' ,await redis.get('otp'));

    /* 6. TTL(Time To Live) là thời gian còn lại (tính bằng giây) trước khi một key
     bị Redis xóa đi(hết hạn). Khi bạn set một key có thời hạn
    const ttl = await redis.ttl('otp');
    console.log(`Thời gian còn lại của otp: ${ttl} giây`);
    */

    //Dùng setInterval để check nhiều lần
    const interval = setInterval(async () =>{
        const ttl = await redis.ttl('otp');
        console.log(`Thời gian còn lại của otp: ${ttl} giây`);
         if(ttl <= 0){
            clearInterval(interval);
            console.log('Key đã hết hạn');
            //redis.disconnect();
         }
    }, 5000); //mỗi 1 giây log ra ttl
    
    setTimeout(async () =>{
        const value = await redis.get('otp');
        console.log('Sau 30s, giá trị của otp là: ', value); // sẽ in ra: null
    }, 30000); //đợi 40 giây

    redis.disconnect(); // đóng kết nối sau khi chạy xong

}

run();

/* Redis String — lợi ích và ứng dụng thực tế
String là kiểu đơn giản nhất nhưng cực kỳ mạnh mẽ, vì:

🔹 Lợi ích:
Nhanh và nhẹ: Lưu trữ dạng key-value đơn giản nhất, tốc độ truy xuất cực nhanh.

Hỗ trợ cache rất hiệu quả.

Có thể lưu dữ liệu đếm số lượt, TTL, token, JSON dạng chuỗi…

🔸 Ứng dụng thực tế:
cache nghĩa là bộ nhớ đệm – nơi lưu trữ tạm thời dữ liệu để giúp truy xuất nhanh hơn khi cần dùng lại lần sau.
✅ Cache nội dung trang web (dạng HTML, JSON đã build sẵn)

✅ Cache kết quả truy vấn DB: giảm truy vấn trực tiếp vào database.

✅ Lưu access token, sessionId kèm EX (expire time).

✅ Counter (số lượt xem bài viết, số người online…)

*/