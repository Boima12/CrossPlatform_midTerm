# Progress Plan

## Đề tài

Xây dựng ứng dụng quản trị tài khoản người dùng bằng React Native và Firebase.

Ứng dụng cho phép admin đăng nhập, xem danh sách tài khoản, thêm, chỉnh sửa, xóa, tìm kiếm và lọc tài khoản.

## Phạm vi dữ liệu

Collection Firestore:

```text
users
```

Mỗi tài khoản chỉ gồm 4 trường:

```text
email
matkhau
hoten
hinhanh
```

Tài khoản admin mặc định:

```text
Email: admin@gmail.com
Mật khẩu: adminsecretpassword
```

> Mật khẩu được lưu trực tiếp trong Firestore theo phạm vi bài giữa kỳ/demo. Cách này không phù hợp cho ứng dụng thực tế.

## Tiến độ thực hiện

### Giai đoạn 1: Chuẩn bị Firebase

- [ ] Kiểm tra cấu hình Firebase trong `src/firebaseConfig.ts`.
- [ ] Tạo hoặc chọn Firebase project.
- [ ] Bật Firestore Database.
- [ ] Tạo collection `users`.
- [ ] Thêm tài khoản admin mặc định.
- [ ] Kiểm tra quyền đọc và ghi dữ liệu.

### Giai đoạn 2: Chuẩn bị cấu trúc ứng dụng

- [x] Xác định màn hình đăng nhập.
- [x] Xác định màn hình quản lý tài khoản.
- [x] Chuyển tên và nội dung giao diện hiện tại từ inventory sang user management.
- [x] Định nghĩa type `User` với đúng 4 trường dữ liệu.
- [x] Loại bỏ các trường cũ như `name`, `quantity`, `category`, `location`, `createdAt`.

### Giai đoạn 3: Chức năng đăng nhập

- [x] Tạo form nhập email.
- [x] Tạo form nhập mật khẩu.
- [x] Kiểm tra tài khoản với dữ liệu trong collection `users`.
- [x] Hiển thị thông báo khi email hoặc mật khẩu không đúng.
- [x] Chuyển đến màn hình quản trị sau khi đăng nhập thành công.
- [x] Thêm chức năng đăng xuất.
- [x] Ngăn người dùng chưa đăng nhập truy cập màn hình quản trị trong phiên chạy hiện tại.

### Giai đoạn 4: Chức năng hiển thị tài khoản

- [x] Lấy danh sách tài khoản từ Firestore.
- [x] Hiển thị danh sách bằng `FlatList`.
- [x] Hiển thị hình ảnh từ trường `hinhanh`.
- [x] Hiển thị email.
- [x] Hiển thị họ tên.
- [x] Thêm trạng thái đang tải dữ liệu.
- [x] Thêm thông báo khi xảy ra lỗi tải dữ liệu.

### Giai đoạn 5: Chức năng thêm tài khoản

- [x] Tạo form thêm tài khoản.
- [x] Nhập email.
- [x] Nhập mật khẩu.
- [x] Nhập họ tên.
- [x] Thêm nút chọn hình ảnh từ thiết bị.
- [x] Xin quyền truy cập thư viện ảnh khi cần.
- [x] Hiển thị ảnh đã chọn trước khi lưu.
- [ ] Kiểm tra định dạng và kích thước hình ảnh.
- [x] Tải hình ảnh lên Firebase Storage.
- [x] Lưu đường dẫn hoặc URL hình ảnh vào trường `hinhanh` trong Firestore.
- [x] Kiểm tra các trường bắt buộc.
- [x] Kiểm tra định dạng email.
- [x] Lưu tài khoản vào collection `users`.
- [x] Xóa dữ liệu form sau khi thêm thành công.

### Giai đoạn 6: Chức năng chỉnh sửa tài khoản

- [x] Thêm nút chỉnh sửa trên mỗi tài khoản.
- [x] Mở form với dữ liệu hiện tại.
- [x] Cho phép chỉnh sửa email.
- [x] Cho phép chỉnh sửa mật khẩu.
- [x] Cho phép chỉnh sửa họ tên.
- [x] Cho phép chỉnh sửa hình ảnh.
- [x] Cập nhật dữ liệu bằng `updateDoc`.
- [x] Hiển thị thông báo khi cập nhật thành công hoặc thất bại.

### Giai đoạn 7: Chức năng xóa tài khoản

- [x] Thêm nút xóa trên mỗi tài khoản.
- [x] Hiển thị hộp thoại xác nhận trước khi xóa.
- [x] Xóa tài khoản bằng `deleteDoc`.
- [x] Cập nhật lại danh sách sau khi xóa.
- [x] Hiển thị thông báo lỗi nếu xóa thất bại.

### Giai đoạn 8: Tìm kiếm và lọc

- [x] Thêm thanh tìm kiếm.
- [x] Tìm kiếm theo email.
- [x] Tìm kiếm theo họ tên.
- [x] Thêm lựa chọn `Tất cả`.
- [x] Thêm lựa chọn lọc theo `Email`.
- [x] Thêm lựa chọn lọc theo `Họ tên`.
- [x] Hiển thị kết quả phù hợp theo từ khóa.
- [x] Hiển thị trạng thái khi không có kết quả.

### Giai đoạn 9: Hoàn thiện giao diện

- [ ] Tận dụng lại UI CRUD hiện tại.
- [ ] Điều chỉnh tiêu đề và nhãn thành tiếng Việt.
- [ ] Tối ưu bố cục cho màn hình điện thoại.
- [ ] Kiểm tra giao diện khi bàn phím mở.
- [ ] Kiểm tra hiển thị hình ảnh lỗi hoặc không có hình ảnh.
- [ ] Kiểm tra giao diện sáng/tối nếu vẫn sử dụng theme hiện tại.

### Giai đoạn 10: Kiểm thử

- [ ] Đăng nhập đúng tài khoản admin.
- [ ] Đăng nhập sai email.
- [ ] Đăng nhập sai mật khẩu.
- [ ] Thêm tài khoản hợp lệ.
- [ ] Kiểm tra dữ liệu mới trên Firebase.
- [ ] Chỉnh sửa tài khoản.
- [ ] Xóa tài khoản.
- [ ] Tìm kiếm theo email.
- [ ] Tìm kiếm theo họ tên.
- [ ] Kiểm tra từng bộ lọc.
- [ ] Đăng xuất.
- [ ] Khởi động lại ứng dụng và kiểm tra dữ liệu vẫn được giữ lại.
- [ ] Kiểm tra trường hợp Firestore mất kết nối.

## Kiểm tra kỹ thuật cuối cùng

```bash
npx expo lint
npx tsc --noEmit
```

## Tiêu chí hoàn thành

- [ ] Admin đăng nhập được bằng tài khoản mặc định.
- [ ] Danh sách tài khoản hiển thị đúng 4 trường.
- [ ] Admin thêm được tài khoản.
- [ ] Admin chỉnh sửa được tài khoản.
- [ ] Admin xóa được tài khoản.
- [ ] Tìm kiếm và lọc hoạt động đúng.
- [ ] Dữ liệu được lưu và đọc từ Firestore.
- [ ] Không còn logic inventory hoặc các trường dữ liệu cũ.
- [ ] Lint và TypeScript không báo lỗi mới.
