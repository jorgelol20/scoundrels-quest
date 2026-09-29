<?php

// Fase 0 i18n: mensajes propios de la API en español (fallback).
return [
    'locale_ok' => 'Idioma resuelto correctamente.',
    'unauthenticated' => 'No autenticado.',

    // Auth
    'invalid_credentials' => 'Las credenciales no son correctas.',
    'logout_ok' => 'Sesión cerrada correctamente',

    // Permisos genéricos
    'forbidden' => 'No tienes los permisos necesarios para acceder a este recurso.',

    // Eliminaciones
    'carta_deleted' => 'Carta eliminada',
    'habilidad_deleted' => 'Habilidad eliminada',
    'modificador_deleted' => 'Modificador eliminado',
    'personaje_deleted' => 'Personaje eliminado',
    'partida_deleted' => 'Partida eliminada',
    'usuario_deleted' => 'Usuario eliminado',
    'usuario_avatar_deleted' => 'Foto de perfil eliminada',
    'usuario_banner_deleted' => 'Banner eliminado',

    // Comentarios de partidas
    'comentario_added' => 'Comentario añadido con éxito',
    'comentario_updated' => 'Comentario actualizado con éxito',
    'comentario_deleted' => 'Comentario eliminado correctamente',
    'comentario_not_found' => 'El comentario no existe',

    // Logros
    'logro_registered' => 'Logro registrado.',
    'logro_completed' => 'Logro completado.',
    'progreso_updated' => 'Progreso actualizado.',

    // Notificaciones
    'notificacion_vista' => 'Notificación marcada como vista.',
    'notificaciones_vistas' => 'Todas las notificaciones marcadas como vistas.',
    'notif_reporte_created' => 'Se ha creado tu reporte correctamente.',
    'notif_reporte_updated' => 'Tu reporte ha sido modificado.',
    'notif_reporte_estado' => 'El estado de tu reporte ha cambiado.',
    'notif_reporte_comentario' => 'Han puesto un comentario a tu reporte.',
    'notif_partida_comentario' => 'Tu partida (ID: :id) ha recibido un nuevo comentario.',
    'notif_comentario_deleted' => 'Se ha eliminado uno de tus comentarios.',

    // Comentarios de reportes (aborts)
    'forbidden_comentarios_view' => 'No tienes permiso para ver estos comentarios.',
    'forbidden_comentario_delete' => 'No tienes permiso para eliminar este comentario.',
    'comentario_not_in_reporte' => 'Comentario no encontrado en este reporte.',
    'forbidden_reporte_view' => 'No tienes permiso para ver este reporte.',
    'forbidden_reporte_delete' => 'No tienes permiso para eliminar este reporte.',

    // FormRequests: usuarios
    'user_nick_required' => 'El nick es obligatorio.',
    'user_nick_max' => 'El nick no puede superar los 30 carácteres.',
    'user_nick_string' => 'El nick no puede estar vacío.',
    'user_nick_unique' => 'Este nick ya está en uso.',
    'user_password_regex' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial [-_@$!%*?&].',
    'user_password_required' => 'La contraseña es obligatoria.',
    'user_password_min' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial [-_@$!%*?&].',
    'user_password_string' => 'La contraseña no puede estar vacía.',
    'user_email_email' => 'El correo introducido no es válido.',
    'user_email_required' => 'El correo es obligatorio.',
    'user_email_unique' => 'Este correo ya está en uso.',
    'user_email_regex' => 'El correo no tiene un formato válido.',
    'user_avatar_image' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
    'user_avatar_mimes' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
    'user_avatar_max' => 'Tamaño máximo de la imagen: 2MB',
    'user_banner_image' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
    'user_banner_mimes' => 'Solo se admiten los formatos JPG, JPEG, PNG, WEBP y GIF',
    'user_banner_max' => 'Tamaño máximo de la imagen: 2MB',
    'user_color_regex' => 'El formato del color debe ser hexadecimal',

    // FormRequests: reportes de bugs
    'reporte_descripcion_required' => 'La descripción es obligatoria.',
    'reporte_descripcion_string' => 'La descripción no puede estar vacía.',
    'reporte_descripcion_max' => 'La descripción no puede superar los 2000 carácteres.',
    'reporte_logs_string' => 'Los logs de la partida no son válidos.',
    'reporte_tipo_required' => 'El tipo de reporte es obligatorio.',
    'reporte_tipo_in' => 'El tipo debe ser: visual, jugabilidad, rendimiento, error u otro.',
    'reporte_severidad_in' => 'La severidad debe ser: baja, media, alta o crítica.',
    'reporte_plataforma_string' => 'La plataforma no es válida.',
    'reporte_plataforma_max' => 'La plataforma no puede superar los 100 carácteres.',
    'reporte_screenshot_image' => 'Solo se admiten los formatos JPG, JPEG, PNG y WEBP',
    'reporte_screenshot_mimes' => 'Solo se admiten los formatos JPG, JPEG, PNG y WEBP',
    'reporte_screenshot_max' => 'Tamaño máximo de la captura: 4MB',
    'reporte_comentario_required' => 'El comentario no puede estar vacío.',
    'reporte_comentario_string' => 'El comentario no es válido.',
    'reporte_comentario_max' => 'El comentario no puede superar los 250 carácteres.',
    'reporte_estado_required' => 'El estado es obligatorio.',
    'reporte_estado_in' => 'El estado debe ser: abierto, en revisión, solucionado, descartado o duplicado.',
];
