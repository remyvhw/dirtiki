<?php

namespace App\Settings;

use Setting;
use Version;

class SettingsMigration
{

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
        Setting::set("meta.version", Version::number());
        $this->saveSettings();
    }
}
