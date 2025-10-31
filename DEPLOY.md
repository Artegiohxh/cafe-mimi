# Инструкции по деплою Cafe Mimi

## Шаг 1: Создание GitHub репозитория

1. Перейдите на https://github.com/new
2. Создайте новый репозиторий с именем `cafe-mimi` (или любое другое)
3. **НЕ** добавляйте README, .gitignore или лицензию (у нас уже есть)

## Шаг 2: Загрузка кода в GitHub

Выполните следующие команды в терминале:

```bash
cd "/Users/admin/Cafe Mimi"
git remote add origin https://github.com/YOUR_USERNAME/cafe-mimi.git
git branch -M main
git push -u origin main
```

Замените `YOUR_USERNAME` на ваш GitHub username.

## Шаг 3: Деплой на Netlify (рекомендуется)

1. Перейдите на https://app.netlify.com
2. Нажмите "Add new site" → "Import an existing project"
3. Выберите GitHub и авторизуйтесь
4. Выберите репозиторий `cafe-mimi`
5. Настройки билда:
   - **Build command**: `pnpm build:client`
   - **Publish directory**: `dist/spa`
   - **Base directory**: (оставьте пустым)
6. Нажмите "Deploy site"
7. Дождитесь завершения деплоя
8. Ваш сайт будет доступен по адресу: `https://your-site-name.netlify.app`

## Альтернатива: Деплой на Vercel

1. Перейдите на https://vercel.com
2. Нажмите "Add New Project"
3. Импортируйте репозиторий `cafe-mimi`
4. Настройки:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build:client`
   - **Output Directory**: `dist/spa`
   - **Install Command**: `pnpm install`
5. Нажмите "Deploy"

## После деплоя

Ваш сайт будет доступен по публичной ссылке, которую можно использовать для демо!

**Примечание**: Если нужны API endpoints, они уже настроены в `netlify/functions/api.ts` и будут работать автоматически на Netlify.

