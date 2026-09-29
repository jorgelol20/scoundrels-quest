<?php

namespace App\Notifications;

use App\Models\Usuarios;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistroNotificacionUsuario extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Usuarios $usuario)
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
            ->subject(__('mail.registro_subject'))
            ->line(__('mail.registro_line1'))
            ->action(__('mail.registro_action'), config('app.frontend_url') . "/perfil/{$this->usuario->nick}")
            ->line(__('mail.registro_line2'));
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
