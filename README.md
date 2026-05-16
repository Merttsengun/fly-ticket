# FlyTicket ✈️

Türkiye'nin 81 ili arasında uçuş bileti satışı yapan full-stack web uygulaması.

## Kullanılan Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Veritabanı | MySQL |
| Kimlik Doğrulama | Bearer Token (in-memory) |
| E-posta | Nodemailer + Gmail SMTP |
| Şifreleme | bcryptjs |

## Özellikler

- 81 il arasında uçuş arama ve filtreleme
- İnteraktif koltuk seçim haritası (6 koltuk/sıra, uçak düzeni)
- Kullanıcı kaydı / girişi ve bilet geçmişi
- Rezervasyon sonrası otomatik e-bilet gönderimi
- Admin paneli: uçuş, bilet ve havayolu CRUD işlemleri
- Ödeme simülasyonu (kart format doğrulaması)
- Tek pist kuralı: aynı şehirde ±60 dakika çakışma engeli

## Kurulum

### Gereksinimler

- Node.js (v18+)
- MySQL (v8+)

### 1. Depoyu klonlayın

```bash
git clone https://github.com/<kullanıcı-adınız>/flyticket.git
cd flyticket
```

### 2. Bağımlılıkları yükleyin

```bash
cd backend
npm install
```

### 3. Ortam değişkenlerini ayarlayın

`backend/.env.example` dosyasını `backend/.env` olarak kopyalayın ve doldurun:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=flyticket
SESSION_SECRET=your_secret_key
PORT=3000
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # Gmail Uygulama Şifresi
```

> **Gmail SMTP:** Google hesabında 2 Adımlı Doğrulama açık olmalı ve "Uygulama Şifresi" oluşturulmalıdır.

### 4. Veritabanını kurun

```bash
# MySQL'de veritabanını oluşturun ve 81 şehri + admin kullanıcısını ekleyin
node backend/db/setup.js
```

### 5. Sunucuyu başlatın

```bash
cd backend
npm run dev
```

### 6. Tarayıcıda açın

```
http://localhost:3000
```

## Giriş Bilgileri

### Admin Girişi

| Alan | Değer |
|------|-------|
| Kullanıcı Adı | `admin` |
| Şifre | `admin123` |
| URL | `http://localhost:3000/admin-login.html` |

### Kullanıcı Girişi

Kayıt sayfasından yeni hesap oluşturulabilir:  
`http://localhost:3000/register.html`

## Sayfa Yapısı

| Sayfa | URL |
|-------|-----|
| Ana Sayfa (Uçuş Arama) | `/` |
| Rezervasyon | `/booking.html` |
| Rezervasyon Onayı | `/success.html` |
| Kullanıcı Girişi | `/login.html` |
| Kayıt | `/register.html` |
| Biletlerim | `/my-tickets.html` |
| Admin Girişi | `/admin-login.html` |
| Admin Paneli | `/admin-panel.html` |

## API Dokümantasyonu (Özet)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/cities` | 81 il listesi |
| GET | `/api/flights` | Uçuş ara |
| POST | `/api/tickets` | Bilet al |
| GET | `/api/tickets/:ref` | Rezervasyon sorgula |
| POST | `/api/auth/register` | Kayıt |
| POST | `/api/auth/login` | Kullanıcı girişi |
| GET | `/api/auth/my-tickets` | Bilet geçmişi |
| POST | `/api/admin/login` | Admin girişi |

## Veritabanı Şeması

```
cities       (id, name)
airlines     (id, name, code, created_at)
flights      (id, flight_number, departure_city_id, arrival_city_id,
              departure_time, arrival_time, price, seats_total, seats_available,
              airline_id, departure_hour_slot, arrival_hour_slot, created_at)
users        (id, name, surname, email, password_hash, created_at)
tickets      (id, flight_id, passenger_name, passenger_surname, passenger_email,
              booking_reference, seat_number, user_id, booked_at)
admins       (id, username, password_hash, created_at)
```

Tam tablo tanımları: `backend/db/schema.sql`

## Proje Yapısı

```
dynamic web final/
├── backend/
│   ├── server.js               # Express uygulaması
│   ├── .env                    # Ortam değişkenleri (git'e eklenmez)
│   ├── db/
│   │   ├── connection.js       # MySQL bağlantı havuzu
│   │   ├── schema.sql          # Tablo tanımları
│   │   └── setup.js            # DB kurulum scripti
│   ├── routes/                 # API route'ları
│   ├── middleware/             # Auth middleware
│   └── utils/
│       └── mailer.js           # E-posta gönderimi
└── frontend/
    ├── index.html
    ├── booking.html
    ├── success.html
    ├── login.html
    ├── register.html
    ├── my-tickets.html
    ├── admin-login.html
    ├── admin-panel.html
    └── css/
        └── style.css
```
