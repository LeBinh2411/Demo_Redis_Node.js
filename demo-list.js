// Tạo 1 redis sử dụng thư viện ioredis
const Redis = require('ioredis');
//Tạo 1 redis mới đê kết nối
const redis = new Redis({
    host: 'localhost',
    port: 6379,
});
/*List là danh sách các chuỗi được xếp theo thứ tự chèn vào, giống mảng trong JavaScript nhưng chỉ chứa chuỗi(string)
Nó có thêm thêm phần tử vào đầu hoặc cuối danh sách, lấy pt đầu hoặc cuối
Nó giống như 1 mảng queue(hàng đợi) vào trước ra trước
Cũng như Stack(ngăn xếp) vào sau ra trước
Danh sách này có thể chứa các phần tử trùng nhau và được duy trì thứ tự.*/

async function demoList(){

    //Tạo 1 biến lưu key danh sách
    const key = 'mylist';

    // Xóa trước nếu có
    await redis.del(key);

    // 1. Thêm phần tử vào danh sách
    //thêm vào cuối - Right Push
    await redis.rpush(key, 'apple', 'banana', 'cherry');
    //thêm vào đầu - Left Push
    await redis.lpush(key, 'mango');

    // 2.  lrange - Lấy tất cả phần tử
    const getAll = await redis.lrange(key, 0, -1);
    console.log('Danh sách hiện tại:', getAll);

    // 3. llen - Lấy độ dài
    const lengh = await redis.llen(key);
    console.log('Dộ dài: ', lengh);

    // 4. lindex - Lấy phần tử tại index(vị trí), lấy đầu 0, cuối -1
    const atIndex1 = await redis.lindex(key, 1);
    console.log('Phần tử ở vị trí 1: ', atIndex1);

    const atIndex0 = await redis.lindex(key, 0);
    console.log('Phần tử đầu tiên 0 là: ', atIndex0);

    const atIndexxx = await redis.lindex(key, -1);
    console.log('Phần tử cuối cùng là: ', atIndexxx);

    // 5. Xóa phần tử ở đầu - lpop, và ở cuối - rpop
    const first = await redis.lpop(key);
    console.log('Đã xóa phần tử đầu tiên', first);
    const last = await redis.rpop(key);
    console.log('Đã xóa phần tử cuối: ', last);

    // 6. lset - Cập nhật phần tử theo index
    const update = await redis.lset('mylist', 1, 'hahahahhahaha');
    console.log('Đã cập nhật: ', update);
    //Check danh dách xem đã xóa chưa
    const final = await redis.lrange(key, 0, -1);
    console.log('Danh sách còn lại: ', final);

    // 7.ltrim - Giữ lại các phần tử từ start đến stop
    await redis.rpush(key, 'A', 'B', 'C', 'D', 'E');
    await redis.ltrim('mylist', 1, 3);
    console.log('Danh sách cuối cùng: ', await redis.lrange(key,0 , -1));

    await redis.quit();
}

demoList();


/* 1. Danh sách hàng đợi (Queue)
Redis List hoạt động theo cơ chế FIFO (First-In-First-Out), rất giống một hàng chờ.

👉 Bạn có thể dùng LPUSH để đưa task vào đầu hàng và RPOP để lấy task từ cuối hàng.

Ví dụ thực tế:

Một hệ thống xử lý đơn hàng: người dùng đặt hàng sẽ được thêm vào hàng đợi, sau đó một worker lấy ra từng đơn để xử lý.

2. Danh sách thông báo (Notifications)
Mỗi người dùng có thể có một danh sách các thông báo gần nhất được lưu bằng Redis List.

👉 Dùng LPUSH để thêm thông báo mới vào đầu danh sách, và LTRIM để chỉ giữ lại ví dụ 50 thông báo gần nhất.

Ví dụ thực tế:

Bạn push thông báo "Bạn có 1 tin nhắn mới" vào list notifications:userId123.

Sử dụng LTRIM notifications:userId123 0 49 để chỉ giữ lại 50 thông báo gần nhất (mới nhất ở đầu danh sách).

3. Lưu log tạm thời (Temporary logs)
Mỗi lần có lỗi hoặc sự kiện gì đó xảy ra, bạn lưu vào một list Redis để debug nhanh.

👉 Dùng RPUSH để thêm log mới vào cuối danh sách, và giới hạn số log bằng LTRIM.

Ví dụ thực tế:

Ghi log "API /login failed" vào logs:error.

Mỗi lần push log xong thì trim lại LTRIM logs:error -100 -1 để giữ lại 100 dòng log gần nhất.
*/
