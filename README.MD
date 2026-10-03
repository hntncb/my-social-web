# Post API — RESTful Blog Backend

Backend API cho ứng dụng blog, được xây dựng bằng Node.js và Express. Dự án tập trung vào thiết kế REST API, xác thực và phân quyền người dùng, làm việc với PostgreSQL, quản lý migration cơ sở dữ liệu và kiểm thử tự động.

**Trạng thái dự án:** Đã đưa mã nguồn lên GitHub. GitHub Actions đã chạy thành công. Dự án hiện chưa được deploy lên môi trường production.

## Mục lục

* [Tính năng chính](#tính-năng-chính)
* [Công nghệ sử dụng](#công-nghệ-sử-dụng)
* [Cấu trúc dự án](#cấu-trúc-dự-án)
* [Yêu cầu môi trường](#yêu-cầu-môi-trường)
* [Cài đặt và chạy local](#cài-đặt-và-chạy-local)
* [API Endpoints](#api-endpoints)
* [Cơ sở dữ liệu và migration](#cơ-sở-dữ-liệu-và-migration)
* [Kiểm thử](#kiểm-thử)
* [GitHub Actions](#github-actions)
* [Biến môi trường](#biến-môi-trường)
* [Bảo mật](#bảo-mật)
* [Hướng phát triển](#hướng-phát-triển)

## Tính năng chính

* Xây dựng REST API cho người dùng và bài viết.
* Đăng ký và đăng nhập tài khoản.
* Xác thực bằng JSON Web Token (JWT).
* Mã hóa mật khẩu bằng `bcrypt`.
* Phân quyền truy cập cho các thao tác liên quan đến người dùng.
* Hỗ trợ phân trang danh sách bài viết.
* Sử dụng PostgreSQL để lưu trữ dữ liệu.
* Quản lý thay đổi cấu trúc cơ sở dữ liệu bằng `dbmate`.
* Tích hợp Swagger UI để xem tài liệu API.
* Có unit test và integration test.
* Sử dụng Docker Compose để hỗ trợ môi trường phát triển và kiểm thử.
* Tích hợp GitHub Actions để tự động chạy quy trình CI.
* File .env ở đây để chạy  tiện hơn thay cho Actions secrets and variables.

## Công nghệ sử dụng

| Công nghệ           | Mục đích                                           |
| ------------------- | -------------------------------------------------- |
| Node.js 22          | Môi trường chạy JavaScript phía server             |
| Express 5           | Xây dựng REST API                                  |
| PostgreSQL 16       | Hệ quản trị cơ sở dữ liệu                          |
| JWT                 | Xác thực người dùng                                |
| bcrypt              | Mã hóa mật khẩu                                    |
| Swagger             | Tài liệu API                                       |
| dbmate              | Quản lý database migration                         |
| Node.js Test Runner | Chạy kiểm thử                                      |
| Docker Compose      | Quản lý các dịch vụ phục vụ phát triển và kiểm thử |
| GitHub Actions      | Tự động hóa kiểm tra mã nguồn                      |

## Cấu trúc dự án

```text
.
├── src/
│   ├── app.js
│   ├── server.js
│   └── test/
│       └── unit/
├── db/
│   └── migrations/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

Đây là cấu trúc tổng quan. Các thư mục và tệp khác có thể được bổ sung tùy theo mã nguồn thực tế.

## Yêu cầu môi trường

Trước khi chạy dự án, cần cài đặt:

* Node.js 22 trở lên
* npm
* Docker và Docker Compose nếu sử dụng Docker để chạy PostgreSQL

## Cài đặt và chạy local

### 1. Clone repository

```bash
git clone https://github.com/hntncb/my-social-web
cd my-social-web
```

### 2. Cài đặt dependencies

```bash
npm install
```
### 3. Khởi chạy PostgreSQL

Nếu sử dụng Docker Compose:

```bash
docker compose up -d postgres
```

### 4. Chạy database migration

```bash
npx dbmate up
```

Đảm bảo biến `DATABASE_URL` được cấu hình chính xác và cơ sở dữ liệu đã sẵn sàng.

### 5. Khởi động API

```bash
npm run dev
```

Cổng chạy ứng dụng được cấu hình thông qua biến `PORT`. Sau khi khởi động, có thể truy cập Swagger UI tại đường dẫn `/api` theo cấu hình của ứng dụng.

## API Endpoints

Dự án có các nhóm API chính sau:

| Nhóm API   | Đường dẫn   | Mô tả                                 |
| ---------- | ----------- | ------------------------------------- |
| Xác thực   | `/v1/auth`  | Đăng ký và đăng nhập                  |
| Người dùng | `/v1/users` | Các thao tác liên quan đến người dùng |
| Bài viết   | `/v1/posts` | Các thao tác liên quan đến bài viết   |

Một số endpoint xác thực:

| Phương thức | Endpoint            | Mô tả             |
| ----------- | ------------------- | ----------------- |
| `POST`      | `/v1/auth/register` | Đăng ký tài khoản |
| `POST`      | `/v1/auth/login`    | Đăng nhập         |

### Tài liệu API

Swagger UI được cấu hình tại:

```text
/api
```

Sử dụng Swagger UI để xem chi tiết request, response và các endpoint được định nghĩa trong mã nguồn.

## Cơ sở dữ liệu và migration

Dự án sử dụng PostgreSQL để lưu trữ dữ liệu và `dbmate` để quản lý các thay đổi cấu trúc cơ sở dữ liệu.

Một số lệnh thường dùng:

```bash
# Chạy các migration chưa được áp dụng
npx dbmate up

# Kiểm tra trạng thái migration
npx dbmate status

# Tạo migration mới
npx dbmate new <migration_name>
```

## Kiểm thử

Dự án có unit test và integration test. Các lệnh kiểm thử được khai báo trong `package.json`.

```bash
# Chạy unit test
npm run test:unit

# Chạy integration test
npm run test:integration

# Chạy toàn bộ test
npm test
```

Integration test sử dụng Docker Compose theo cấu hình hiện tại của dự án.

## GitHub Actions

Dự án đã tích hợp GitHub Actions để tự động chạy quy trình kiểm tra được cấu hình trong repository.

**Trạng thái hiện tại:** Workflow đã chạy thành công.

Để xem chi tiết kết quả:

1. Mở repository trên GitHub.
2. Chọn tab **Actions**.
3. Chọn lần chạy workflow tương ứng.
4. Xem kết quả của từng job và từng bước trong workflow.

Kết quả thành công cho thấy các bước được cấu hình trong workflow đã hoàn tất. Phạm vi kiểm tra cụ thể phụ thuộc vào nội dung file workflow.

## Biến môi trường

Các biến được khai báo trong `.env.example` gồm:

| Biến                | Mô tả                      |
| ------------------- | -------------------------- |
| `PORT`              | Cổng chạy API              |
| `POSTGRES_USER`     | Tên người dùng PostgreSQL  |
| `POSTGRES_PASSWORD` | Mật khẩu PostgreSQL        |
| `POSTGRES_DB`       | Tên cơ sở dữ liệu          |
| `DATABASE_URL`      | Chuỗi kết nối PostgreSQL   |
| `REDIS_URL`         | Chuỗi kết nối Redis        |
| `JWT_SECRET`        | Khóa bí mật dùng để ký JWT |
| `JWT_EXPIRES_IN`    | Thời hạn hiệu lực của JWT  |

Các giá trị cụ thể cần được thiết lập theo môi trường chạy thực tế.

## Bảo mật

* Mật khẩu được xử lý bằng `bcrypt`.
* JWT được sử dụng cho cơ chế xác thực.
* Các thao tác yêu cầu quyền truy cập được kiểm soát bằng middleware tương ứng.
* Thông tin cấu hình nhạy cảm được cung cấp thông qua biến môi trường.

## Hướng phát triển

Một số hướng có thể cân nhắc trong các phiên bản tiếp theo:

* Mở rộng unit test và integration test cho các trường hợp lỗi.
* Hoàn thiện tài liệu API và ví dụ request/response.
* Bổ sung logging và cải thiện xử lý lỗi.
* Hoàn thiện tính năng cache nếu tiếp tục sử dụng Redis.
* Cân nhắc triển khai khi dự án đáp ứng yêu cầu thực tế.

---

## Mục tiêu dự án

Dự án được xây dựng nhằm thực hành và thể hiện kỹ năng phát triển backend, bao gồm thiết kế REST API, xác thực và phân quyền, làm việc với PostgreSQL, quản lý migration, kiểm thử tự động và tích hợp CI bằng GitHub Actions.
