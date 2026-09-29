<?php

// Fase 0 i18n: API messages in English.
return [
    'locale_ok' => 'Locale resolved successfully.',
    'unauthenticated' => 'Unauthenticated.',

    // Auth
    'invalid_credentials' => 'The credentials are not correct.',
    'logout_ok' => 'Session closed successfully',

    // Generic permissions
    'forbidden' => 'You do not have the necessary permissions to access this resource.',

    // Deletions
    'carta_deleted' => 'Card deleted',
    'habilidad_deleted' => 'Skill deleted',
    'modificador_deleted' => 'Modifier deleted',
    'personaje_deleted' => 'Character deleted',
    'partida_deleted' => 'Game deleted',
    'usuario_deleted' => 'User deleted',
    'usuario_avatar_deleted' => 'Profile picture removed',
    'usuario_banner_deleted' => 'Banner removed',

    // Game comments
    'comentario_added' => 'Comment added successfully',
    'comentario_updated' => 'Comment updated successfully',
    'comentario_deleted' => 'Comment deleted successfully',
    'comentario_not_found' => 'The comment does not exist',

    // Achievements
    'logro_registered' => 'Achievement registered.',
    'logro_completed' => 'Achievement completed.',
    'progreso_updated' => 'Progress updated.',

    // Notifications
    'notificacion_vista' => 'Notification marked as seen.',
    'notificaciones_vistas' => 'All notifications marked as seen.',
    'notif_reporte_created' => 'Your report has been created successfully.',
    'notif_reporte_updated' => 'Your report has been modified.',
    'notif_reporte_estado' => 'Your report status has changed.',
    'notif_reporte_comentario' => 'Someone has commented on your report.',
    'notif_partida_comentario' => 'Your game (ID: :id) has received a new comment.',
    'notif_comentario_deleted' => 'One of your comments has been deleted.',

    // Report comments (aborts)
    'forbidden_comentarios_view' => 'You do not have permission to view these comments.',
    'forbidden_comentario_delete' => 'You do not have permission to delete this comment.',
    'comentario_not_in_reporte' => 'Comment not found in this report.',
    'forbidden_reporte_view' => 'You do not have permission to view this report.',
    'forbidden_reporte_delete' => 'You do not have permission to delete this report.',

    // FormRequests: users
    'user_nick_required' => 'The nickname is required.',
    'user_nick_max' => 'The nickname may not exceed 30 characters.',
    'user_nick_string' => 'The nickname may not be empty.',
    'user_nick_unique' => 'This nickname is already in use.',
    'user_password_regex' => 'The password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number and a special character [-_@$!%*?&].',
    'user_password_required' => 'The password is required.',
    'user_password_min' => 'The password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number and a special character [-_@$!%*?&].',
    'user_password_string' => 'The password may not be empty.',
    'user_email_email' => 'The email entered is not valid.',
    'user_email_required' => 'The email is required.',
    'user_email_unique' => 'This email is already in use.',
    'user_email_regex' => 'The email does not have a valid format.',
    'user_avatar_image' => 'Only JPG, JPEG, PNG, WEBP and GIF formats are allowed',
    'user_avatar_mimes' => 'Only JPG, JPEG, PNG, WEBP and GIF formats are allowed',
    'user_avatar_max' => 'Maximum image size: 2MB',
    'user_banner_image' => 'Only JPG, JPEG, PNG, WEBP and GIF formats are allowed',
    'user_banner_mimes' => 'Only JPG, JPEG, PNG, WEBP and GIF formats are allowed',
    'user_banner_max' => 'Maximum image size: 2MB',
    'user_color_regex' => 'The color format must be hexadecimal',

    // FormRequests: bug reports
    'reporte_descripcion_required' => 'The description is required.',
    'reporte_descripcion_string' => 'The description may not be empty.',
    'reporte_descripcion_max' => 'The description may not exceed 2000 characters.',
    'reporte_logs_string' => 'The game logs are not valid.',
    'reporte_tipo_required' => 'The report type is required.',
    'reporte_tipo_in' => 'The type must be: visual, gameplay, performance, error or other.',
    'reporte_severidad_in' => 'The severity must be: low, medium, high or critical.',
    'reporte_plataforma_string' => 'The platform is not valid.',
    'reporte_plataforma_max' => 'The platform may not exceed 100 characters.',
    'reporte_screenshot_image' => 'Only JPG, JPEG, PNG and WEBP formats are allowed',
    'reporte_screenshot_mimes' => 'Only JPG, JPEG, PNG and WEBP formats are allowed',
    'reporte_screenshot_max' => 'Maximum screenshot size: 4MB',
    'reporte_comentario_required' => 'The comment may not be empty.',
    'reporte_comentario_string' => 'The comment is not valid.',
    'reporte_comentario_max' => 'The comment may not exceed 250 characters.',
    'reporte_estado_required' => 'The status is required.',
    'reporte_estado_in' => 'The status must be: open, under review, solved, discarded or duplicate.',
];
