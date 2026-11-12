# ShuttleGo

Monorepo gồm:

- [`frontend/`](frontend/) — ứng dụng mobile (Expo / React Native)
- [`backend/`](backend/) — Express.js MVC (JSON View + TypeORM + PostgreSQL), xem [backend/README.md](backend/README.md)

## Chạy frontend

```bash
cd frontend
npm install
npx expo start
```

## Chạy backend

```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

Xem chi tiết ở [`backend/README.md`](backend/README.md).
