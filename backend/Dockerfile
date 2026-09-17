FROM php:8.3-apache

# Install dependencies sistem yang dibutuhkan Laravel & PostgreSQL
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev git curl

# Install PHP Extensions untuk Laravel & Neon PostgreSQL
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd
RUN a2enmod rewrite

# --- SYARAT MUTLAK HUGGING FACE: Ubah Port Apache ke 7860 ---
RUN sed -i 's/80/7860/g' /etc/apache2/ports.conf
RUN sed -i 's/:80/:7860/g' /etc/apache2/sites-available/000-default.conf

# Direct DocumentRoot ke /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

# Copy seluruh file dari folder backend
COPY . .

# Install Composer Dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# --- SYARAT MUTLAK HUGGING FACE: Permission untuk Non-Root User (ID 1000) ---
RUN chown -R 1000:1000 /var/www/html \
    && chown -R 1000:1000 /var/log/apache2 \
    && chown -R 1000:1000 /var/run/apache2 \
    && chown -R 1000:1000 /var/lib/apache2 \
    && chmod -R 777 /var/www/html/storage \
    && chmod -R 777 /var/www/html/bootstrap/cache

# Paksa Apache berjalan menggunakan User 1000
ENV APACHE_RUN_USER=#1000
ENV APACHE_RUN_GROUP=#1000
ENV APACHE_PID_FILE=/var/run/apache2/apache2.pid
ENV APACHE_RUN_DIR=/var/run/apache2
ENV APACHE_LOCK_DIR=/var/lock/apache2
ENV APACHE_LOG_DIR=/var/log/apache2

USER 1000
EXPOSE 7860
CMD ["apache2-foreground"]
