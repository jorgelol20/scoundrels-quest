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
            ->subject("Nuevo reporte de bug: {$this->reporteBug->titulo}")
            ->greeting("Se ha abierto un nuevo reporte de bug")
            ->line("Tipo: {$this->reporteBug->tipo}")
            ->line("Descripción: {$this->reporteBug->descripcion}")
            ->action("Ver el reporte", config('app.frontend_url') . "/reportes-bug/{$this->reporteBug->id}")
            ->line('¡Trabaja!');
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
