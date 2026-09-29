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
            ->subject(__('mail.comentario_subject'))
            ->greeting(__('mail.comentario_greeting'))
            ->line(__('mail.comentario_line'))
            ->action(__('mail.comentario_action'), config('app.frontend_url') . "/reportes-bug/{$this->comentario->reporte->id}");
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
