FROM php:8.2-apache

RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql

# Activar mod_rewrite
RUN a2enmod rewrite

# Copiar solo backend al root de Apache
COPY backend/ /var/www/html/

EXPOSE 80
