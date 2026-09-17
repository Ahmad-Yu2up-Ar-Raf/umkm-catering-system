# 1. Base Image Resmi FrankenPHP (Debian Bookworm)
FROM dunglas/frankenphp:php8.4-bookworm

# 2. Install utility OS yang dibutuhkan
RUN apt-get update && apt-get install -y \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 3. Install ekstensi PHP (Wajib ada pcntl untuk Octane & zip untuk Composer)
RUN install-php-extensions pdo pdo_pgsql bcmath opcache pcntl zip

# 4. Ambil Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 5. Copy seluruh codebase
COPY . .

# 6. Install dependensi Production
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# 7. Kunci Cache Route & View (JANGAN masukkan config:cache di sini!)
RUN php artisan route:cache && \
    php artisan view:cache

# 8. Set Permission Storage
RUN chmod -R 777 storage bootstrap/cache

# 9. Buka Port untuk Hugging Face
EXPOSE 7860

# 10. ENTRYPOINT: Jalankan Laravel Octane dengan server FrankenPHP
ENTRYPOINT ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=7860"]
