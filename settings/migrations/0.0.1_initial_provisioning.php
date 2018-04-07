<?php

use App\Settings\SettingsMigration;

class InitialProvisioning extends SettingsMigration
{
    public $version = "0.0.1";

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function run()
    {
        Setting::set("general.app_name", "Dirtiki");

        Setting::set("permissions.public_read", true);
        Setting::set("permissions.public_update", false);
        Setting::set("permissions.public_create", false);
        Setting::set("permissions.public_delete", false);
        Setting::set("permissions.user_update", true);
        Setting::set("permissions.user_create", true);
        Setting::set("permissions.user_delete", false);

        Setting::set("users.allow_signups", true);

        Setting::set("maps.provider", "null");
    }

}
