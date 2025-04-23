# Hotel Pro - Mehmonxona Boshqaruv Tizimi

Hotel Pro - bu zamonaviy mehmonxona boshqaruv tizimi bo'lib, mehmonxona xodimlari uchun qulay interfeys va keng funksionallikni taqdim etadi.

## Asosiy Xususiyatlar

- 🏨 Mehmonxona xonalarini boshqarish
- 👥 Mehmonlarni ro'yxatdan o'tkazish va boshqarish
- 💰 To'lovlarni boshqarish
- 📊 Hisobotlar va statistikalar
- 🔐 Xavfsiz autentifikatsiya tizimi
- 🌐 Zamonaviy va qulay interfeys

## Texnologiyalar

- **Frontend:**
  - Next.js 14
  - React 18
  - TypeScript
  - Tailwind CSS
  - Radix UI komponentlari
  - Shadcn/ui

- **Backend:**
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)

## O'rnatish

1. Loyihani klonlang:
```bash
git clone [repository-url]
cd hotelpro
```

2. Zarur paketlarni o'rnating:
```bash
npm install
```

3. `.env` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Ma'lumotlar bazasini sozlang:
```bash
npm run setup-db
```

5. Loyihani ishga tushiring:
```bash
npm run dev
```

## Ishga tushirish

- Rivojlanish rejimi: `npm run dev`
- Ishlab chiqarish uchun qurish: `npm run build`
- Ishlab chiqarish rejimida ishga tushirish: `npm run start`

## Loyiha Tuzilishi

```
hotelpro/
├── app/                 # Next.js ilova fayllari
├── components/          # UI komponentlari
├── contexts/           # React kontekstlari
├── hooks/              # Maxsus React hooklari
├── lib/                # Yordamchi funksiyalar
├── services/           # Xizmatlar va API integratsiyalari
├── styles/             # Global stillar
├── supabase/           # Supabase migratsiyalari va funksiyalari
├── types/              # TypeScript interfeyslari
└── public/             # Statik fayllar
```

## Xavfsizlik

- Barcha API so'rovlari Supabase Row Level Security (RLS) orqali himoyalangan
- Xavfsiz autentifikatsiya tizimi
- Ma'lumotlar bazasi migratsiyalari va siyosatlari

## Yordam

Agar sizda savollar yoki muammolar bo'lsa, iltimos, GitHub repositorysida issue oching.

## Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatilgan. 