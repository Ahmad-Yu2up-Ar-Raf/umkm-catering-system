FROM dunglas/frankenphp:php8.3-bookworm

# 1. Install ekstensi PHP wajib
RUN install-php-extensions pdo pdo_pgsql bcmath opcache pcntl zip gd

# 2. Copy Composer dari image resmi
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 3. Copy file dependensi terlebih dahulu (Docker Layer Caching)
COPY composer.json composer.lock ./

# 4. Install dependensi TANPA menjalankan artisan scripts saat build
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --no-scripts --optimize-autoloader

# 5. Copy seluruh sisa codebase
COPY . .

# 6. Set permission storage & cache
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 7860

# 7. Jalankan Laravel Octane
ENTRYPOINT ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=7860"]
