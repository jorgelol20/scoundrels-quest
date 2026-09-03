<?php

namespace App\Console\Commands;

use App\Models\Usuarios;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanUnusedUserImages extends Command
{
    protected $signature = 'images:clean-unused {--dry-run : Solo muestra qué se borraría, sin borrar nada}';

    protected $description = 'Elimina archivos de avatar y banner que ya no están referenciados por ningún usuario';

    /**
     * Ajusta estos valores a como guardas tus imágenes.
     */
    protected string $disk = 'public';
    protected string $directory = 'usuarios';

    public function handle(): int
    {
        $disk = Storage::disk($this->disk);

        if (!$disk->exists($this->directory)) {
            $this->warn("El directorio '{$this->directory}' no existe en el disco '{$this->disk}'.");
            return Command::SUCCESS;
        }

        // Obtener archivos de 'avatar' en uso
        $avatars = Usuarios::query()
            ->whereNotNull('avatar')
            ->where('avatar', '!=', '')
            ->pluck('avatar');

        // Obtener archivos de 'banner' en uso
        $banners = Usuarios::query()
            ->whereNotNull('banner')
            ->where('banner', '!=', '')
            ->pluck('banner');

        // Combinar ambas colecciones, extraer solo el nombre del archivo y mapear para búsqueda rápida
        $usedFiles = $avatars->concat($banners)
            ->filter()
            ->map(fn ($path) => basename($path))
            ->unique()
            ->flip();

        $allFiles = $disk->files($this->directory);

        $deleted = 0;
        $isDryRun = $this->option('dry-run');

        foreach ($allFiles as $filePath) {
            $filename = basename($filePath);

            if (!isset($usedFiles[$filename])) {
                if ($isDryRun) {
                    $this->line("[dry-run] Se eliminaría: {$filePath}");
                } else {
                    $disk->delete($filePath);
                    $this->info("Eliminado: {$filePath}");
                }
                $deleted++;
            }
        }

        $this->info("Total: {$deleted} archivo(s) " . ($isDryRun ? 'detectados' : 'eliminados') . " de {$this->directory}.");

        return Command::SUCCESS;
    }
}