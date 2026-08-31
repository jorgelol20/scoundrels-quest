#!/usr/bin/env sh
set -eu

# Laravel necesita poder escribir en storage/ y bootstrap/cache
# (especialmente storage/framework/views para Blade compilado).
# En despliegues con bind mounts, estos directorios pueden quedar con owner root
# y php-fpm corre como www-data, provocando 500 en runtime.
fix_perms() {
  # Solo si existe el proyecto montado
  if [ -d /var/www ]; then
    mkdir -p \
      /var/www/storage/framework/views \
      /var/www/storage/framework/cache \
      /var/www/storage/framework/sessions \
      /var/www/storage/logs \
      /var/www/bootstrap/cache

    # Intentar ajustar ownership; si el FS no lo permite, no abortar.
    chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true

    # Permisos típicos: dirs 775, ficheros 664 (grupo escribible).
    chmod -R ug+rwX /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true
    find /var/www/storage /var/www/bootstrap/cache -type d -exec chmod 775 {} \; 2>/dev/null || true
  fi
}

fix_perms

exec "$@"
