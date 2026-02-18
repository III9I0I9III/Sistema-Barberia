FROM php:8.2-apache

RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql

RUN a2enmod rewrite

RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

COPY . /var/www/html/

WORKDIR /var/www/html/

EXPOSE 80

CMD ["apache2-foreground"]
