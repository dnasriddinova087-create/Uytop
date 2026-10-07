# 🏠 UyTop — O'zbekiston Bo'yicha Zamonaviy Uy-Ijara Platformasi

UyTop — O'zbekiston ko'chmas mulk va ijara bozori uchun ishlab chiqilgan, yagona Python (FastAPI) backend va umumiy ma'lumotlar bazasi asosida ishlaydigan **Veb ilova (React + Vite + TypeScript)** hamda **Mobil ilova (React Native + Expo Go + TypeScript)** ekotizimidir.

---

## 📑 Mundarija
1. [Loyiha Arxitekturasi](#1-loyiha-arxitekturasi)
2. [Tizim Talablari](#2-tizim-talablari)
3. [O'rnatish va Sozlash (Windows)](#3-ornatish-va-sozlash-windows)
4. [Ma'lumotlar Bazasi va Namunaviy Ma'lumotlar](#4-malumotlar-bazasi-va-namunaviy-malumotlar)
5. [Birinchi Adminni Xavfsiz Yaratish](#5-birinchi-adminni-xavfsiz-yaratish)
6. [Loyiha Qismlarini Ishga Tushirish](#6-loyiha-qismlarini-ishga-tushirish)
7. [Telefonni (Expo Go) Backendga Ulash](#7-telefonni-expo-go-backendga-ulash)
8. [Uchta Asosiy Rol Imkoniyatlari](#8-uchta-asosiy-rol-imkoniyatlari)
9. [30 ta Uy Sharoiti (Tri-State Tizimi)](#9-30-ta-uy-sharoiti-tri-state-tizimi)
10. [Avtomatlashtirilgan Testlarni Bajarish](#10-avtomatlashtirilgan-testlarni-bajarish)
11. [Xatoliklarni Bartaraf Etish (Troubleshooting)](#11-xatoliklarni-bartaraf-etish-troubleshooting)

---

## 1. Loyiha Arxitekturasi

Platforma 3 ta asosiy mustaqil qismdan iborat:

```
UYTOP/
├── backend/                  # Python FastAPI REST API server
│   ├── app/
│   │   ├── api/v1/           # Auth, Users, Properties, Favorites, Chat, Admin, Locations
│   │   ├── models/           # SQLAlchemy ORM modellari
│   │   ├── schemas/          # Pydantic v2 validatsiya sxemalari
│   │   ├── services/         # Parol heshlash, JWT, fayl yuklash, masofa hisoblash
│   │   ├── database.py       # Engine va session boshqaruvi
│   │   ├── cli.py            # CLI: init-db, seed, create-admin
│   │   └── main.py           # FastAPI ilovasi
│   ├── tests/                # Pytest avtomatlashtirilgan testlari (15 ta test)
│   ├── uploads/              # Yuklangan uy rasmlari papkasi
│   └── requirements.txt
│
├── web/                      # React + TypeScript + Vite Veb Ilova
│   ├── src/
│   │   ├── components/       # Header, Footer, PropertyCard, AmenityBadge, InteractiveMap
│   │   ├── pages/            # Bosh sahifa, Katalog, Uy tafsilotlari, Kabinetlar, Admin panel, Chat
│   │   ├── services/         # API mijoz
│   │   └── styles/           # Modern dizayn tizimi (index.css)
│   └── package.json
│
├── mobile/                   # React Native + Expo Go + TypeScript Mobil Ilova
│   ├── src/
│   │   ├── components/       # Mobil komponentlar va Tarmoq sozlash modali
│   │   ├── screens/          # Barcha mobil ekranlar (Home, Catalog, Detail, Cabinet, Chat)
│   │   └── services/         # Mobil API va AsyncStorage
│   ├── App.tsx               # Asosiy mobil navigatsiya
│   └── package.json
│
├── scripts/                  # Windows uchun bir bosishda ishga tushiruvchi .bat skriptlar
└── docs/                     # Arxitektura va texnik hujjatlar
```

---

## 2. Tizim Talablari

- **Operatsion tizim:** Windows 10 / 11 (yoki Linux / macOS)
- **Python:** 3.11 yoki 3.12+ (Tekshirish: `python --version`)
- **Node.js:** v20.x yoki v24.x (Tekshirish: `node -v`)
- **Expo Go ilovasi:** Android yoki iOS smartfoni uchun Play Store / App Store dan yuklab olingan

---

## 3. O'rnatish va Sozlash (Windows)

### 3.1. Backendni sozlash
PowerShell yoki buyruqlar satrida:
```powershell
cd backend

# Virtual muhit yaratish
python -m venv .venv

# Virtual muhitni faollashtirish
.\.venv\Scripts\activate

# Kutubxonalarni o'rnatish
pip install -r requirements.txt
```

### 3.2. Veb Ilovani sozlash
```powershell
cd ..\web
npm install
```

### 3.3. Mobil Ilovani sozlash
```powershell
cd ..\mobile
npm install
```

---

## 4. Ma'lumotlar Bazasi va Namunaviy Ma'lumotlar

Development muhitida SQLite avtomatik ishlatiladi (`uytop.db`). Production uchun `.env` faylida PostgreSQL manzilini ko'rsatish kifoya (`DATABASE_URL=postgresql://user:pass@localhost:5432/uytop_db`).

Namunaviy uylar (Toshkent, Samarqand), maklerlar va foydalanuvchilarni yuklash:
```powershell
cd backend
.\.venv\Scripts\python.exe -m app.cli seed
```
yoki `scripts\seed-data.bat` faylini ikki marta bosing.

---

## 5. Birinchi Adminni Xavfsiz Yaratish

Admin roli oddiy ro'yxatdan o'tish formasidan olinmaydi. Admin hisobini faqat maxsus xavfsiz boshqaruv buyrug'i orqali yaratish mumkin:

```powershell
cd backend
.\.venv\Scripts\python.exe -m app.cli create-admin --first-name "Ulug'bek" --last-name "Admin" --phone "+998901112233" --password "SizningKuchliParolingiz123!" --email "admin@uytop.uz"
```
yoki `scripts\create-admin.bat` faylini ishga tushirib, ma'lumotlarni kiriting.

---

## 6. Loyiha Qismlarini Ishga Tushirish

### 1-usul: Tayyor `.bat` skriptlar orqali (Eng oson)
1. `scripts\start-backend.bat` ni ishga tushiring (Port: 8000).
2. `scripts\start-web.bat` ni ishga tushiring (Port: 5173).
3. `scripts\start-mobile.bat` ni ishga tushiring (Port: 8081).

### 2-usul: Qo'lda buyruqlar orqali

#### Backendni ishga tushirish:
```powershell
cd backend
.\.venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Swagger API Hujjatlari: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Veb Ilovani ishga tushirish:
```powershell
cd web
npm run dev
```
- Veb Ilova: [http://localhost:5173](http://localhost:5173)

#### Mobil Ilovani (Expo) ishga tushirish:
```powershell
cd mobile
npx expo start
```
- Terminalda QR-kod chiqadi.

---

## 7. Telefonni (Expo Go) Backendga Ulash

Smartfoningizdagi Expo Go ilovasi kompyuterdagi backendga ulanishi uchun:
1. Kompyuter va telefon **bitta Wi-Fi tarmog'iga** ulangan bo'lishi shart.
2. Kompyuteringizning LAN IP manzili: masalan, `172.50.4.33` (yoki `ipconfig` orqali aniqlanadi).
3. Mobil ilovaning yuqori o'ng burchagidagi **Sozlamalar (⚙️)** tugmasini bosing:
   - IP manzilni kiriting: `http://172.50.4.33:8000/api/v1`
   - **"Ulanishni sinash"** tugmasini bosing. Yashil tasdiq chiqqach, **"Saqlash"** tugmasini bosing.
   - Barcha e'lonlar, rasmlar va foydalanuvchilar real telefonda ham ko'rinadi!

---

## 8. Uchta Asosiy Rol Imkoniyatlari

| Rol | Ruxsatlar va Imkoniyatlar |
|---|---|
| **ADMIN** | Butun tizim statistikasi, barcha foydalanuvchilarni bloklash / ochish, maklerlarni rasmiy tekshiruvdan o'tkazish, e'lonlarni tasdiqlash / rad etish (sabab bilan), shikoyatlarni ko'rish, audit jurnali. |
| **MAKLER** | Shaxsiy kabinet, "+ Yangi uy qo'shish" (koordinatalar, 30 ta qulaylik, fotosuratlar yuklash), o'z e'lonlarini tahrirlash, "Ijaraga berildi" deb belgilash, e'lonni yashirish / qayta ochish / arxivlash, mijozlar bilan chat. |
| **MIJOZ** | Uylarni xarita va filtrlash orqali qidirish, sevimlilarga saqlash, maklerga telefon qilish / chat yozish, shikoyat yuborish, profilni boshqarish. |

---

## 9. 30 ta Uy Sharoiti (Tri-State Tizimi)

Har bir sharoit 3 ta holatga ega:
1. **Mavjud (Bor)** — Yashil belgi
2. **Mavjud emas (Yo'q)** — Qizil belgi
3. **Ma'lumot yo'q (?)** — Kulrang belgi

Qo'llab-quvvatlanadigan barcha 30 ta qulaylik:
- 🧺 Kir yuvish mashinasi
- 📶 Wi-Fi
- ❄️ Konditsioner
- 🧊 Muzlatgich
- 📺 Televizor
- 🛏 Mebel
- 🍳 Oshxona
- 🚿 Dush
- 🛁 Vanna
- ♨️ Issiq suv
- 💧 Sovuq suv
- 🔥 Gaz
- ⚡ Elektr
- 🌡 Isitish tizimi
- 🌬 Shamollatish
- 🪟 Balkon
- 🛗 Lift
- 🚗 Avtoturargoh
- 🔐 Xavfsiz kirish
- 🎥 Videokuzatuv
- 🧹 Tozalash xizmati
- 🧺 Choyshab va sochiqlar
- 🍽 Oshxona jihozlari
- 🐈 Uy hayvoni saqlash mumkin
- 🚭 Chekish mumkin
- 👨‍👩‍👧 Oilalar uchun qulay
- 🎓 Talabalar uchun qulay
- 👩 Faqat ayollar uchun
- 👨 Faqat erkaklar uchun
- ♿ Nogironligi bo'lgan insonlar uchun qulayliklar

---

## 10. Avtomatlashtirilgan Testlarni Bajarish

Backendning barcha funksiyalari (Autentifikatsiya, E'lonlar CRUD, Filtrlash, Sevimlilar, Chat, Admin huquqlari) 100% testlar bilan qoplangan:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -v
```
Natija: **15 passed** (100% muvaffaqiyatli).

Veb ilovaning TypeScript va Production Build tekshiruvi:
```powershell
cd web
npm run build
```
Natija: **Built successfully (0 errors)**.

Mobil ilovaning TypeScript tekshiruvi:
```powershell
cd mobile
npx tsc --noEmit
```
Natija: **0 errors**.

---

## 11. Xatoliklarni Bartaraf Etish (Troubleshooting)

1. **Telefon Expo Go da backendga ulanmayapti ("Network request failed"):**
   - Kompyuter va telefon aynan bitta Wi-Fi routerga ulanganligini tekshiring.
   - Windows Firewall da 8000-portga ruxsat berilganligini tekshiring.
   - Ilova sozlamalarida `http://<KOMPYUTER_IP>:8000/api/v1` to'g'ri kiritilganini tekshiring.
2. **Rasmlar ochilmayapti:**
   - Backend ishlayotganligini va `backend/uploads` papkasiga ruxsat borligini tekshiring.
3. **Admin panelga oddiy akkaunt kira olmadi:**
   - Xavfsizlik talablariga ko'ra, oddiy ro'yxatdan o'tgan foydalanuvchilar Admin panelga kira olmaydi. Admin akkauntini `app.cli create-admin` orqali yarating.
