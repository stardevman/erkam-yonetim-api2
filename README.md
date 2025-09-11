# Erkam API

Bu proje Mongoose ile kurulmuş bir Node.js Express API'sidir. Controllers, Services ve Routes mimarisi kullanılarak geliştirilmiştir. **Firebase Storage entegrasyonu ile dosya upload desteği bulunmaktadır.**

## Kurulum

1. Proje bağımlılıklarını yükleyin:

```bash
npm install
```

2. `.env` dosyasını oluşturun ve veritabanı + Firebase bağlantı bilgilerinizi ekleyin:

```env
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=erkam_api
PORT=3000

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-content\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project-name.appspot.com
```

3. Veritabanına örnek veri ekleyin:

```bash
npm run seed
```

4. Uygulamayı çalıştırın:

```bash
# Production için
npm start

# Development için (nodemon ile)
npm run dev
```

## API Endpoints

### Authors

- `GET /v1/authors` - Tüm yazarları listele
  - Query parametresi: `limit` (varsayılan: 10)
- `GET /v1/authors/:id` - Belirli bir yazarı getir
- `POST /v1/authors` - Yeni yazar oluştur
- `PUT /v1/authors/:id` - Yazarı güncelle
- `DELETE /v1/authors/:id` - Yazarı sil

### Örnek Request Body (POST/PUT):

````json
### Books (Firebase Storage Entegrasyonu ile)

- `GET /v1/books` - Tüm kitapları listele
  - Query parametresi: `limit` (varsayılan: 10)
- `GET /v1/books/:isbn` - Belirli bir kitabı getir
- `POST /v1/books` - Yeni kitap oluştur (with file upload)
- `PUT /v1/books/:isbn` - Kitabı güncelle (with optional file upload)
- `DELETE /v1/books/:isbn` - Kitabı sil (dosyalar da silinir)
- `GET /v1/books/search` - Kitapları filtrele ve ara
- `PUT /v1/books/:isbn/image` - Sadece kitap resmini güncelle
- `PUT /v1/books/:isbn/document` - Sadece kitap dosyasını güncelle

#### Kitap Oluşturma (POST /v1/books)

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `image` (file): Kitap kapak resmi (JPEG, PNG, GIF, WebP - Max: 5MB)
- `document` (file): Kitap dosyası (PDF, EPUB, MOBI, TXT - Max: 50MB)
- `isbn` (string): Kitap ISBN'i
- `name` (string): Kitap adı
- `description` (string): Kitap açıklaması
- `pages` (number): Sayfa sayısı
- `author` (ObjectId): Yazar ID'si
- `category` (ObjectId): Kategori ID'si (opsiyonel)
- `language` (string): Dil kodu (tr, en, ar, fr, de, es, it, ru, zh)
- `createdBy` (string): Oluşturan kişi
- `relatedBook` (ObjectId): İlişkili kitap ID'si (çeviri için)
- `translationsId` (ObjectId): Çeviri grubu ID'si

#### Kitap Güncelleme (PUT /v1/books/:isbn)

**Content-Type**: `multipart/form-data`

Yukarıdaki fieldların hepsi opsiyonel. Sadece değiştirmek istediğiniz alanları gönderebilirsiniz.

#### Sadece Resim Güncelleme (PUT /v1/books/:isbn/image)

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `image` (file): Yeni kitap kapak resmi

#### Sadece Dosya Güncelleme (PUT /v1/books/:isbn/document)

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `document` (file): Yeni kitap dosyası

#### Örnek Response:

```json
{
  "success": true,
  "data": {
    "_id": "60d5f484f8d2e835d8b5b9a0",
    "isbn": "978-0123456789",
    "name": "Örnek Kitap",
    "description": "Bu bir örnek kitap açıklamasıdır.",
    "pages": 350,
    "author": {
      "_id": "60d5f484f8d2e835d8b5b9a1",
      "name": "Erkam Güneysu"
    },
    "imageUrl": "https://storage.googleapis.com/your-bucket/images/unique-id.jpg",
    "fileUrl": "https://storage.googleapis.com/your-bucket/documents/unique-id.pdf",
    "language": "tr",
    "isVisible": true,
    "createdAt": "2025-07-13T12:00:00.000Z",
    "updatedAt": "2025-07-13T12:00:00.000Z"
  }
}
````

### Dosya Upload Özellikleri

- **Güvenli Dosya Depolama**: Firebase Storage kullanımı
- **Otomatik Dosya Validasyonu**: Dosya türü ve boyut kontrolü
- **Benzersiz Dosya İsimlendirme**: UUID ile çakışma önleme
- **Eski Dosya Temizleme**: Güncelleme/silme sırasında eski dosyalar silinir
- **Desteklenen Resim Formatları**: JPEG, PNG, GIF, WebP (Max: 5MB)
- **Desteklenen Doküman Formatları**: PDF, EPUB, MOBI, TXT (Max: 50MB)

// ...existing code...

## Proje Yapısı

```
├── app.js                           # Ana uygulama dosyası
├── package.json
├── config/
│   ├── db-connect.js               # MongoDB Mongoose bağlantısı
│   └── firebase-admin.js           # Firebase Admin SDK konfigürasyonu
├── middleware/
│   └── upload-middleware.js        # Multer file upload middleware
├── services/
│   └── file-upload-service.js      # Firebase Storage upload service
├── models/
│   ├── Author.js                   # Author Mongoose modeli
│   ├── Book.js                     # Book Mongoose modeli (updated)
│   ├── Category.js                 # Category Mongoose modeli
│   ├── User.js                     # User Mongoose modeli
│   └── Translation.js              # Translation Mongoose modeli
├── controllers/
│   └── v1/
│       ├── author-controller.js
│       ├── book-controller.js      # Updated with file upload support
│       ├── category-controller.js
│       └── user-controller.js
├── services/
│   └── v1/
│       ├── author-service.js
│       ├── book-service.js
│       ├── category-service.js
│       └── user-service.js
├── routes/
│   └── v1/
│       ├── author-routes.js
│       ├── book-routes.js          # Updated with file upload routes
│       ├── category-routes.js
│       └── user-routes.js
└── scripts/
    └── seed.js                     # Veritabanı seed script'i
```

## Mongoose Schema

Author modeli aşağıdaki alanları içerir:

- `name` (String, required)
- `description` (String, required)
- `imageUrl` (String, optional)
- `createdAt` (Date, otomatik)
- `updatedAt` (Date, otomatik)
