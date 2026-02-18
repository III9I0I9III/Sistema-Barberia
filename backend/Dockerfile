FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/backend/api/public

RUN apt-get update && apt-get install -y libpq-dev \
  && docker-php-ext-install pdo_pgsql pgsql \
  && a2enmod rewrite \
  && sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
  && printf '<Directory "%s">\nAllowOverride All\nRequire all granted\n</Directory>\n' "$APACHE_DOCUMENT_ROOT" \
     > /etc/apache2/conf-available/app.conf \
  && a2enconf app \
  && echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf \
  && a2enconf servername

COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html