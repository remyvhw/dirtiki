<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Setting;

class DirtikiSetting
{
    public $level;
    public $structure;
    public $key;

    public function __construct(array $structure, string $key, ?int $level = 0)
    {
        $this->structure = $structure;
        $this->key = $key;
        $this->level = $level;
    }

    public function children(): Collection
    {
        $keyPrefix = $this->key;
        $level = $this->level + 1;
        return collect(array_get($this->structure, "children", []))->mapWithKeys(function ($structure, $key) use ($keyPrefix, $level) {
            $key = "{$keyPrefix}.{$key}";
            return [$key => new DirtikiSetting($structure, $key, $level)];
        });
    }

    public function label(): ?string
    {
        return array_get($this->structure, "label");
    }

    public function rules()
    {
        return array_get($this->structure, "rules", "");
    }

    function default(): ?string {
        return array_get($this->structure, "default", null);
    }

    public function paramName(): string
    {
        return str_replace(".", "_", $this->key);
    }

    public function getValue()
    {
        return Setting::get($this->key, $this->default());
    }

    public function groupName(): string
    {
        return collect(explode(".", $this->key))->first();
    }

    public function groupLessKey(): string
    {
        return collect(explode(".", $this->key))->slice(1)->implode(".");
    }

    public function group()
    {
        return Setting::get($this->groupName());
    }

    public function setValue($value)
    {
        $group = $this->group();
        array_set($group, $this->groupLessKey(), $value);
        Setting::set($this->groupName(), $group);
    }

    public function __toString(): string
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
                        "rules" => "required|min:2|max:32",
                        "default" => config("app.name"),
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
            $this->validate($request, $rules, [], $customAttributes);

            collect($request->only($group->children()->map(function ($setting) {
                return $setting->paramName();
            })->toArray()))->each(function ($input, $paramName) use ($group) {
                $setting = $group->children()->filter(function ($setting) use ($paramName) {
                    return $setting->paramName() === $paramName;
                })->first();
                $setting->setValue($input);
            });

            Setting::save();

        }

        return view('settings.edit', ['settings' => $dirtikiSettings, 'group' => $group]);
    }

}
