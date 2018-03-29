<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Version;

class MigrateSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'settings:migrate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Upgrade settings so they are compatible with the latest version of the app.';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $currentVersion = Version::version();
        $migrationsPath = base_path("settings/migrations");
        $files = preg_grep('/^([^.])/', scandir($migrationsPath));
        collect($files)->values()->map(function ($filename) {

            $nameparts = collect(explode("_", str_replace(".php", "", $filename)));

            if (!$nameparts->count()) {
                return null;
            }

            return [
                "version" => $nameparts->shift(),
                "filename" => $filename,
                "className" => studly_case($nameparts->implode("_")),
            ];
        })->filter(function ($file) use ($currentVersion) {
            return version_compare($currentVersion, data_get($file, "version", 0));
        })->each(function ($file) use ($migrationsPath) {
            require_once ($migrationsPath . "/" . $file["filename"]);
            $migration = new $file["className"]();
            $migration->migrate();
        });
    }
}
