<?php

namespace App\Settings;

use Setting;
use Version;

class SettingsMigration
{
    public $version = "0.0.0";

    public function saveSettings()
    {
        Setting::save();
    }

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function run()
    {
    }

    public function migrate()
    {
        $this->run();
        Setting::set("meta.version", $this->version);
        $this->saveSettings();
    }
}
