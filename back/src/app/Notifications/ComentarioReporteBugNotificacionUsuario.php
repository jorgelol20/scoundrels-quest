<?php

namespace App\Notifications;

use App\Models\ComentarioReporteBug;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComentarioReporteBugNotificacionUsuario extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ComentarioReporteBug $comentario)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Actualización de tu reporte.")
            ->greeting("Alguien ha comentado en tu reporte")
            ->line("Un administrador ha dejado un comentario en tu reporte.")
            ->action("Ver la página del reporte", config('app.frontend_url') . "/reportes-bug/{$this->comentario->reporte->id}");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
