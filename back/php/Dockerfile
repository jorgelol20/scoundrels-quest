FROM php:8.3-fpm-alpine

# 1. Instalación de dependencias del sistema y extensiones de PHP
# Agrupamos en un solo RUN para reducir el número de capas y el tamaño final
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    mysql-client \
    sed \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    intl \
    zip \
  && rm -rf /var/cache/apk/*

# 2. Composer (Copiado desde la imagen oficial)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 3. Configuración de PHP y scripts
WORKDIR /var/www

# Copiamos la configuración de PHP
COPY uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# Copiamos el entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# --- CRUCIAL: Limpieza de finales de línea y permisos ---
# El 'sed' elimina los caracteres \r de Windows que causan tu error
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# 4. Copiar el resto de la aplicación (opcional si usas volúmenes, pero recomendado para prod)
# COPY . .

# 5. Ejecución
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm"]