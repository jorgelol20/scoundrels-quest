<?php

namespace App\Notifications;

use App\Models\ReporteBug;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NuevoReporteBugNotificacion extends Notification
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
            ->subject(__('mail.nuevo_admin_subject', ['titulo' => $this->reporteBug->titulo]))
            ->greeting(__('mail.nuevo_admin_greeting'))
            ->line(__('mail.nuevo_admin_line_tipo', ['tipo' => $this->reporteBug->tipo]))
            ->line(__('mail.nuevo_admin_line_descripcion', ['descripcion' => $this->reporteBug->descripcion]))
            ->action(__('mail.nuevo_admin_action'), config('app.frontend_url') . "/reportes-bug/{$this->reporteBug->id}")
            ->line(__('mail.nuevo_admin_line_last'));
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
