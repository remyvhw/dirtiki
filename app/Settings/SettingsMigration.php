<?php

namespace App\Settings;

use Setting;

class SettingsMigration
{

    public function loadSettings()
    {
        return Setting::all();
    }

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
        $this->saveSettings();
    }
}
