FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/backend/api/public

RUN apt-get update && apt-get install -y libpq-dev \
  && docker-php-ext-install pdo_pgsql pgsql \
  && a2enmod rewrite \
  # ✅ Cambia SOLO el DocumentRoot (esto está bien)
  && sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
  # ✅ Agrega permisos explícitos para tu carpeta (evita 403)
  && printf '<Directory "%s">\nAllowOverride All\nRequire all granted\n</Directory>\n' "$APACHE_DOCUMENT_ROOT" \
     > /etc/apache2/conf-available/app.conf \
  && a2enconf app

COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html
WORKDIR /var/www/html
