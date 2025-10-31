# Cafe Mimi

Производственный full-stack React приложение с интегрированным Express сервером.

## Технологии

- **Frontend**: React 18 + React Router 6 + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server
- **3D**: Three.js + React Three Fiber
- **Анимации**: GSAP
- **UI**: Radix UI + TailwindCSS 3

## Разработка

```bash
pnpm dev        # Запуск dev сервера (клиент + сервер)
pnpm build      # Production build
pnpm start      # Запуск production сервера
pnpm typecheck  # TypeScript проверка
pnpm test       # Запуск тестов
```

## Деплой

### Netlify

1. Подключите репозиторий к Netlify
2. Build command: `pnpm build`
3. Publish directory: `dist/spa`
4. Deploy!

### Vercel

1. Подключите репозиторий к Vercel
2. Framework preset: Vite
3. Build command: `pnpm build`
4. Output directory: `dist/spa`
5. Deploy!

## Структура проекта

```
client/          # React SPA frontend
server/          # Express API backend
shared/          # Общие типы
public/          # Статические файлы
```

