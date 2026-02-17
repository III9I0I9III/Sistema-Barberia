FROM php:8.2-apache

RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql

# Hacer que Apache escuche en el puerto que Render asigna
RUN sed -i 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf

ENV APACHE_DOCUMENT_ROOT /var/www/html

COPY . /var/www/html/

CMD ["sh", "-c", "apache2-foreground"]
