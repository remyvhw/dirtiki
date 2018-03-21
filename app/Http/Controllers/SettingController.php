<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Setting;

class DirtikiSetting
{
    public $structure;
    public $key;
    public function __construct(array $structure, string $key)
    {
        $this->structure = $structure;
        $this->key = $key;
    }

    public function children()
    {
        $keyPrefix = $this->key;
        return collect(array_get($this->structure, "children", []))->mapWithKeys(function ($structure, $key) use ($keyPrefix) {
            return new DirtikiSetting($structure, "{$keyPrefix}.{$key}");
        });
    }

    public function label()
    {
        return array_get($this->structure, "label");
    }

    public function rules()
    {
        return array_get($this->structure, "rules");
    }

    function default() {
        return array_get($this->structure, "default", null);
    }

    public function getValue()
    {
        return Setting::get($this->key, $this->default());
    }

    public function setValue($value)
    {
        return Setting::set($this->key, $value);
    }

    public function __toString()
    {
        return collect($this)->toJson();
    }

}

class SettingController extends Controller
{

    public function getSettingsMetadata()
    {
        return collect([
            "general" => [
                "label" => __("General"),
                "children" => [
                    "app_name" => [
                        "label" => __("Application Name"),
                        "rules" => "required|min:1|max:32",
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

        return view('settings.edit', ['group' => $group]);
    }

    public function postUpdate(Request $request, string $group)
    {
        $this->authorize("update-settings");
    }
}
