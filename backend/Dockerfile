FROM php:8.2-apache

# ✅ Tu index.php está aquí:
ENV APACHE_DOCUMENT_ROOT=/var/www/html/backend/api/public

RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql \
    && a2enmod rewrite \
    # ✅ IMPORTANTE: usa comillas dobles para expandir la variable
    && sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copia el proyecto completo
COPY . /var/www/html/

# Permisos
RUN chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html