<?php

namespace App\Console\Commands;

use App\Models\Usuarios;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanUnusedUserImages extends Command
{
    protected $signature = 'images:clean-unused {--dry-run : Solo muestra qué se borraría, sin borrar nada}';

    protected $description = 'Elimina archivos de avatar que ya no están referenciados por ningún usuario';

    /**
     * Ajusta estos dos valores a como guardas tus avatares.
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

        $usedFiles = Usuarios::query()
            ->whereNotNull('avatar')
            ->where('avatar', '!=', '')
            ->pluck('avatar')
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