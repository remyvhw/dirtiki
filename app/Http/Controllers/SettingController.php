<?php

namespace App\Http\Controllers;

use App\Settings\DirtikiSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Setting;

class SettingController extends Controller
{

    public function getSettingsMetadata(): Collection
    {
        return collect([
            "general" => [
                "label" => __("General"),
                "children" => [
                    "app_name" => [
                        "label" => __("Application Name"),
                        "rules" => "required|min:2|max:32",
                        "default" => config("app.name"),
                        "type" => DirtikiSetting::TYPE_TEXT,
                    ],

                ],
            ],
            "permissions" => [
                "label" => __("Permissions"),
                "children" => [
                    "public_read" => [
                        "label" => __("Allow anonymous visitors to read pages."),
                        "rules" => "filled|boolean",
                        "default" => true,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                    "public_update" => [
                        "label" => __("Allow anonymous visitors to update existing pages."),
                        "rules" => "filled|boolean",
                        "default" => false,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                    "public_create" => [
                        "label" => __("Allow anonymous visitors to create new pages."),
                        "rules" => "filled|boolean",
                        "default" => false,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                    "public_delete" => [
                        "label" => __("Allow anonymous visitors to delete pages."),
                        "rules" => "filled|boolean",
                        "default" => false,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                    "user_update" => [
                        "label" => __("Allow regular users to update existing pages."),
                        "rules" => "filled|boolean",
                        "default" => true,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                    "user_create" => [
                        "label" => __("Allow regular users to create new pages."),
                        "rules" => "filled|boolean",
                        "default" => true,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                    "user_delete" => [
                        "label" => __("Allow regular users to delete pages."),
                        "rules" => "filled|boolean",
                        "default" => false,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                ],
            ],
            "users" => [
                "label" => __("Users"),
                "children" => [
                    "allow_signups" => [
                        "label" => __("Allow new users to sign up."),
                        "rules" => "filled|boolean",
                        "default" => true,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                    "signup_domains" => [
                        "label" => __("Allow only sign ups with emails addresses from these domains:"),
                        "rules" => "nullable",
                        "default" => "",
                        "type" => DirtikiSetting::TYPE_TEXT,
                        "help" => __("To allow email addresses from multiple domains, separate them with commas. If you don't want to restrict registration to emails from specific domains, leave this field empty."),
                    ],
                ],
            ],
            "maps" => [
                "label" => __("Maps"),
                "children" => [
                    "provider" => [
                        "label" => __("Maps Provider"),
                        "default" => "null",
                        "type" => DirtikiSetting::TYPE_SELECT,
                        "options" => [
                            "null" => "None",
                            "google" => "Google Maps",
                            "mapbox" => "Mapbox",
                        ],
                    ],
                    "api_key" => [
                        "label" => __("API Key"),
                        "rules" => "nullable|required_unless:maps_provider,null|min:30|max:100",
                        "default" => "",
                        "type" => DirtikiSetting::TYPE_TEXT,
                    ],
                ],
            ],
            "captcha" => [
                "label" => __("Captcha"),
                "children" => [
                    "provider" => [
                        "label" => __("CAPTCHA Provider"),
                        "default" => "null",
                        "type" => DirtikiSetting::TYPE_SELECT,
                        "options" => [
                            "null" => "None",
                            "recaptcha" => "reCAPTCHA (Google)",
                        ],
                    ],
                    "public_key" => [
                        "label" => __("Public/Site Key"),
                        "rules" => "nullable|required_unless:captcha_provider,null|min:40|max:100",
                        "default" => "",
                        "type" => DirtikiSetting::TYPE_TEXT,
                    ],
                    "secret_key" => [
                        "label" => __("Secret Key"),
                        "rules" => "nullable|required_unless:captcha_provider,null|min:40|max:100",
                        "default" => "",
                        "type" => DirtikiSetting::TYPE_TEXT,
                    ],
                    "require_on_signup" => [
                        "label" => __("Require CAPTCHA challenge on new user sign ups."),
                        "rules" => "filled|boolean",
                        "default" => true,
                        "type" => DirtikiSetting::TYPE_CHECKBOX,
                    ],
                ],
            ],
        ])->mapWithKeys(function ($structure, $key) {
            return [$key => new DirtikiSetting($structure, $key)];
        });
    }

    public function getIndex(Request $request)
    {
        $this->authorize("update-settings");
        return redirect(route("settings.edit", [$this->getSettingsMetadata()->first()->key]));
    }

    public function getEdit(Request $request, string $group)
    {
        $this->authorize("update-settings");

        $dirtikiSettings = $this->getSettingsMetadata();
        if (!($group = data_get($dirtikiSettings, $group))) {
            abort(404);
        }

        if ($request->isMethod("POST")) {

            $rules = $group->children()->mapWithKeys(function ($setting) {return [$setting->paramName() => $setting->rules()];})->toArray();

            $customAttributes = $group->children()->mapWithKeys(function ($setting) {return [$setting->paramName() => $setting->label()];})->toArray();
            $validated = $this->validate($request, $rules, [], $customAttributes);

            $group->children()->each(function ($setting) use ($validated) {
                $setting->setValue(data_get($validated, $setting->paramName(), false));
            });
            Setting::save();
        }

        return view('settings.edit', ['settings' => $dirtikiSettings, 'group' => $group]);
    }

}
