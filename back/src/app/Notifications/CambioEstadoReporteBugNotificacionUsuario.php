<?php

namespace App\Notifications;

use App\Models\ReporteBug;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CambioEstadoReporteBugNotificacionUsuario extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ReporteBug $reporteBug)
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
            ->subject("Actualización reporte.")
            ->greeting("Tu reporte ha cambiado de estado.")
            ->line("Recientemente, tu reporte ha pasado a: {$this->reporteBug->estado}")
            ->line("Puedes acceder al resto de tus reportes desde tu perfil.")
            ->action("Ver la página del reporte", config('app.frontend_url') . "/reportes-bug/{$this->reporteBug->id}")
            ->line("Att: El equipo de Scoundrel's Quest");
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
