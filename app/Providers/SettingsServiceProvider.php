<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Schema;
use Setting;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        // Avoid relying on settings if no migration has been ran yet.
        if (Schema::hasTable('settings')) {
            return;
        }

        config(["app.name" => Setting::get("general.app_name", "This is Dirtiki")]);

    }

}
