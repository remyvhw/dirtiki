<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
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

        config(["app.name" => Setting::get("general.app_name", "This is Dirtiki")]);

    }

}
