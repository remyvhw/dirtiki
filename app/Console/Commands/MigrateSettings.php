<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Setting;
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
        $currentVersion = Version::number();
        $lastMigrationRan = Setting::get("meta.version");
        $migrationsPath = base_path("settings/migrations");
        $command = $this;
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
        })->filter(function ($file) use ($currentVersion, $lastMigrationRan) {
            return version_compare(data_get($file, "version", 0), $lastMigrationRan) > 0 && version_compare($currentVersion, data_get($file, "version", 0)) >= 0;
        })->sort(function ($a, $b) {
            return version_compare(data_get($a, "version", 0), data_get($b, "version", 0));
        })->each(function ($file) use ($migrationsPath, $command) {
            $command->line("Migrating: " . $file["filename"]);
            require_once ($migrationsPath . "/" . $file["filename"]);
            $migration = new $file["className"]();
            $migration->migrate();
            $command->info("Migrated: " . $file["filename"]);
        })->pipe(function ($collection) use ($command) {
            if (!$collection->count()) {
                $command->info("Nothing to migrate.");
            }
        });
    }
}
