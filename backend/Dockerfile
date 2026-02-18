FROM php:8.2-apache

# Instalar PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql

# Activar mod_rewrite
RUN a2enmod rewrite

# Copiar configuración personalizada de Apache
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# Copiar proyecto
COPY . /var/www/html/

# Permisos
RUN chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html
