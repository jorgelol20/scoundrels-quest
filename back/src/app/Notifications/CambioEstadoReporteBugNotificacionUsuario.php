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
            ->subject(__('mail.cambio_estado_subject'))
            ->greeting(__('mail.cambio_estado_greeting'))
            ->line(__('mail.cambio_estado_line_estado', ['estado' => $this->reporteBug->estado]))
            ->line(__('mail.cambio_estado_line_perfil'))
            ->action(__('mail.cambio_estado_action'), config('app.frontend_url') . "/reportes-bug/{$this->reporteBug->id}");
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
