# Transformatsiya mindmap — loyiha konteksti

Bu fayl claude.ai'dagi suhbatdan ko'chirilgan kontekst. Claude Code shu papkada ishga tushganda uni avtomatik o'qiydi.

## Loyiha nima
- MegaBuild transformatsiya rejasining vizual xaritasi (mindmap): 8 yo'nalish, 324 vazifa.
- Yo'nalishlar (`DATA[].k`): boshqaruv, moliya, hr, qurilish, taminot, savdo, xavfsizlik, xotira.
- Holatlar: `bajarildi`, `jarayonda`, `kechikmoqda`, `rejada`, `tasdiqlanmagan`.
- Interfeys tili: o'zbek kirill (Бажарилди, Сақлаш ва ҳ.к.).
- Ma'lumot manbai: Google Sheets "Transformatsiya_hisobot_Oktyabr_2026_v6"
  (https://docs.google.com/spreadsheets/d/1mBAefvMsG6Oyi6DtzyyAXA6Na9tQaLzKILXhyrqMMiM).
  Baho shkalasi: 0 — qilinmadi, 0.3 — jarayonda, 0.5 — tekshiruvda, 1 — qabul qilindi.

## Hozirgi holat (2026-11-11)
- GitHub: https://github.com/ObidjonFrontEnd/transformatsiya-mindmap (public, branch `main`).
- Vercel: https://transformatsiya-mindmap.vercel.app — Hobby, "Obidjon's projects";
  `main`ga har bir push avtomatik deploy qilinadi.
- Fayllar:
  - `index.html` — butun front (bitta fayl). Ichida `HOLATLAR` massivi (boshlang'ich holatlar)
    va `DATA` (vazifalar tuzilmasi). SVG mindmap, tablar, KPI.
  - `api/_lib.js` — Upstash Redis REST, HMAC sessiya cookie (`mm_s`, HttpOnly, 7 kun).
  - `api/login.js`, `api/logout.js` — login (10 xato urinish / 15 daq. → blok).
  - `api/state.js` — GET: hamma uchun holatlar; POST: faqat login, butun yo'nalish yoziladi;
    `tarix` ro'yxatiga o'zgarishlar yoziladi (oxirgi 500).
- Redis (Upstash, Free, Vercel orqali): `holatlar` hash (maydon = yo'nalish, qiymat = JSON {id: status}).
  Bazadagi holat `HOLATLAR` massividan ustun turadi.
- Vercel env: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `ADMIN_LOGIN` (superadmin), `ADMIN_PASSWORD` (secret).
  Env o'zgarsa — qayta deploy kerak (Vercel'dagi Redeploy tugmasi ishlamadi, bo'sh commit push qilindi).
- Foiz hisobi: bajarildi = 1 ball, tasdiqlanmagan = 0.9, qolganlari = 0 (`W` obyekti, `score()`).

## Ochiq savollar / keyingi bosqich
1. Jarayonda holatiga 0.3 ball berilsinmi? (hal qilinmagan)
2. Saytda vazifa qo'shish / o'chirish: raqamlash (siljitmaslik tavsiya), to'liq o'chirish yoki arxiv,
   bo'lim/yo'nalish qo'shish kerakmi, qisqa + to'liq nom.
3. React'ga ko'chirish va bir vaqtda bir necha kishi tahrirlashi (real-time):
   - hozirgi muammo: "Сақлаш" butun yo'nalishni yozadi → ikki kishi bir-birining o'zgarishini o'chirib yuboradi;
     vazifa darajasida darhol saqlashga o'tish kerak.
   - variantlar: polling (3–5 s, hozirgi Vercel + Redis) yoki real-time xizmat (Liveblocks / Ably / Pusher).
   - har bir tahrirlovchiga alohida login kerakmi (bo'lim rahbarlari faqat o'z yo'nalishi)?
   - "Kim onlayn" ko'rsatilishi kerakmi?
4. Ta'minot: jadvaldagi Oktyabr vazifalari mindmap'dagi Ta'minot vazifalariga mos kelmaydi (0%).
5. `DATA` ichida Moliya 5.1–5.13 to'liq nomlari buzilgan harflar bilan saqlangan.

## Ish uslubi (foydalanuvchi talabi)
- Har javob boshida tushunganini qisqa qaytarib yozish, keyin savol-javob bilan davom etish.
- "Hali kod yozma" deyilsa — faqat reja va savollar.
- Parollar va tokenlar kodga yoki ochiq repozitoriyga yozilmaydi.
