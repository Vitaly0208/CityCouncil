# ===== ЭТАП 1: Сборка =====
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем манифесты и ставим зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходники и собираем
COPY . .
RUN npm run build

# ===== ЭТАП 2: Запуск =====
FROM node:20-alpine
WORKDIR /app

# Копируем собранные файлы из builder
COPY --from=builder /app/dist ./dist

# Устанавливаем лёгкий статический сервер (поддерживает SPA-роутинг)
RUN npm install -g serve

EXPOSE 3000

# -s: single-page mode (все маршруты → index.html для React Router)
# -l: listen port
CMD ["serve", "-s", "dist", "-l", "3000"]