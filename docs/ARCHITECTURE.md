# 🏛 UyTop — Platforma Arxitekturasi va Texnik Hujjatlar

## 1. Tizim Dizayni va Aloqalar (System Architecture)

UyTop platformasi yagona markazlashgan backend arxitekturasi asosida loyihalashtirilgan. Mobil ilova va Veb ilova aynan bir xil ma'lumotlar bazasi va REST API endpointlari bilan ishlaydi:

```
[ Expo Mobil Ilova ] ──┐
                       ├──▶ [ FastAPI REST API (Python) ] ──▶ [ SQLite / PostgreSQL ]
[ React Veb Ilova ]   ──┘                 │
                                          └──▶ [ File Storage (Uploads) ]
```

## 2. Xavfsizlik va RBAC Qoidalari (Role-Based Access Control)

1. **Parollar:** Hech qachon ochiq matnda saqlanmaydi. `bcrypt` algoritmi orqali heshlanadi.
2. **JWT Tokenlar:** Kirishda `access_token` va `refresh_token` taqdim etiladi.
3. **Ruxsatlar:**
   - E'lonlarni faqat Makler yoki Admin yarata oladi.
   - E'lonni faqat uning haqiqiy egasi yoki Admin tahrirlashi yoki holatini o'zgartirishi mumkin.
   - Admin panel endpointlari (`/api/v1/admin/*`) faqat `role == 'admin'` bo'lgan foydalanuvchilar uchungina ochiq.
   - Admin ro'yxatdan o'tish formasidan tanlanishi mumkin emas; faqat CLI boshqaruv vositasi orqali yaratiladi.
4. **Audit Jurnali:** Tizimdagi har bir muhim ma'muriy harakat (bloklash, e'lonni tasdiqlash/rad etish) `audit_logs` jadvaliga qayd etiladi.

## 3. REST API Endpointlar Ro'yxati

| Yo'nalish | Metod | Tavsif | Ruxsat |
|---|---|---|---|
| `/api/v1/auth/register` | POST | Yangi foydalanuvchini ro'yxatga olish | Ochiq |
| `/api/v1/auth/login` | POST | Tizimga kirish va token olish | Ochiq |
| `/api/v1/auth/refresh` | POST | Yangi access token olish | Ochiq |
| `/api/v1/users/me` | GET / PATCH | Joriy profilni ko'rish va yangilash | Autentifikatsiyalangan |
| `/api/v1/properties` | GET | Uylarni filtrlash, qidirish va tartiblash | Ochiq |
| `/api/v1/properties/nearby` | GET | Koordinata bo'yicha eng yaqin uylar | Ochiq |
| `/api/v1/properties/{id}` | GET | Uyning to'liq ma'lumotlari | Ochiq |
| `/api/v1/properties` | POST | Yangi uy e'loni yaratish | Makler / Admin |
| `/api/v1/properties/{id}` | PATCH | Uy e'lonini tahrirlash | Uy egasi / Admin |
| `/api/v1/properties/{id}/rent` | POST | Uyni "Ijaraga berildi" deb belgilash | Uy egasi / Admin |
| `/api/v1/properties/{id}/close` | POST | E'lonni vaqtincha yashirish | Uy egasi / Admin |
| `/api/v1/properties/{id}/reopen` | POST | E'lonni qayta faollashtirish | Uy egasi / Admin |
| `/api/v1/properties/{id}/images` | POST | E'longa fotosuratlar yuklash | Uy egasi / Admin |
| `/api/v1/favorites` | GET / POST / DELETE | Sevimlilar bilan ishlash | Autentifikatsiyalangan |
| `/api/v1/conversations` | GET / POST | Suhbatlar ro'yxati va yangi chat | Autentifikatsiyalangan |
| `/api/v1/conversations/{id}/messages` | GET / POST | Xabarlar tarixi va yangi xabar | Suhbat qatnashchilari |
| `/api/v1/admin/dashboard` | GET | Tizim statistikasi | Admin |
| `/api/v1/admin/users` | GET / PATCH | Foydalanuvchilarni boshqarish / bloklash | Admin |
| `/api/v1/admin/properties` | GET / PATCH | E'lonlarni moderatsiya qilish | Admin |
| `/api/v1/admin/audit-logs` | GET | Audit loglarini ko'rish | Admin |
