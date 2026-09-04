<?php 

namespace App\Services;

use App\Models\ReporteBug;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscordReporteBugService
{
    private $webhookUrl;

    public function __construct(private ReporteBug $reporteBug)
    {
        $this->webhookUrl = config('services.discord.webhook_url');
    }

    public function send(): bool
    {
        try{
            $payload = $this->buildMessage();

            $response = Http::post($this->webhookUrl, $payload);

            if($response->successful()){
                return true;
            }

            Log::error("###DISCORD ERROR### => Error al enviar el reporte a Discord", ['error' => $response->status()]);
            return false;

        }catch(\Exception $e){
            Log::error("###DISCORD ERROR### => Error en el servicio de Discord", ['error' => $e->getMessage()]);
            return false;
        }
    }

    private function buildMessage(): array 
    {
        // Color según la severidad
        $colorPorSeveridad = [
            'critica' => 16711680,    // Rojo
            'alta' => 16776960,       // Amarillo
            'media' => 65535,         // Azul
            'baja' => 65280,          // Verde
        ];

        $color = $colorPorSeveridad[strtolower($this->reporteBug->severidad ?? 'media')] ?? 9437184;

        return [
            'embeds' => [
                [
                    'title' => "🐛Nuevo Reporte: {$this->reporteBug->titulo}",
                    'description' => $this->reporteBug->descripcion,
                    'color' => $color,
                    'fields' => [
                        [
                            'name' => 'Tipo',
                            'value' => ucfirst($this->reporteBug->tipo),
                            'inline' => true
                        ],
                        [
                            'name' => 'Severidad',
                            'value' => ucfirst($this->reporteBug->severidad ?? 'N/A'),
                            'inline' => true
                        ],
                        [
                            'name' => 'Plataforma',
                            'value' => ucfirst($this->reporteBug->plataforma ?? 'N/A'),
                            'inline' => true
                        ],
                        [
                            'name' => 'Estado',
                            'value' => ucfirst($this->reporteBug->estado ?? 'abierto'),
                            'inline' => true
                        ],
                    ],
                    'url' => config('app.frontend_url') . "/reportes-bug/{$this->reporteBug->id}",
                    'timestamp' => $this->reporteBug->created_at->toIso8601String()
                ]
            ]
        ];
    }
}