FROM dunglas/frankenphp:php8.3-bookworm

# 1. Install ekstensi PHP wajib (pcntl dibutuhkan Octane)
RUN install-php-extensions pdo pdo_pgsql bcmath opcache pcntl zip gd

# 2. Copy Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 3. Copy kode backend
COPY . .

# 4. Install dependensi
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# 5. Permission storage
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 7860

# 6. Jalankan Laravel Octane
ENTRYPOINT ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=7860"]
