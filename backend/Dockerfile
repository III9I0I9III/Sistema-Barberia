FROM php:8.2-apache

RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql

# Activar mod_rewrite
RUN a2enmod rewrite

# Permitir .htaccess
RUN sed -i '/<Directory \/var\/www\/>/,/AllowOverride None/s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copiar backend como raíz
COPY backend/ /var/www/html/

EXPOSE 80
