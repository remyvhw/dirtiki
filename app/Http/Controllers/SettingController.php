<?php

namespace App\Http\Controllers;

use Form;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Setting;

class DirtikiSetting
{
    const TYPE_TEXT = "text";
    const TYPE_TEXTAREA = "textarea";
    const TYPE_CHECKBOX = "checkbox";
    const TYPE_NUMBER = "number";
    const TYPE_EMAIL = "email";
    const TYPE_SELECT = "select";

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
        if ($this->type() === self::TYPE_SELECT) {
            return "required|in:" . collect($this->options())->keys()->implode(",");
        }
        return array_get($this->structure, "rules", "");
    }

    public function options()
    {
        return array_get($this->structure, "options", "");
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

    public function group(): ?array
    {
        return Setting::get($this->groupName(), []);
    }

    public function type(): string
    {
        return data_get($this->structure, "type", "text");
    }

    public function fieldHtml(): string
    {
        $type = $this->type();
        if ($type === self::TYPE_TEXTAREA) {
            return Form::textarea($this->paramName(), $this->getValue(), ['class' => 'textarea']);
        } elseif ($type === self::TYPE_EMAIL) {
            return Form::email($this->paramName(), $this->getValue(), ['class' => 'input']);
        } elseif ($type === self::TYPE_NUMBER) {
            return Form::number($this->paramName(), $this->getValue(), ['class' => 'input']);
        } elseif ($type === self::TYPE_CHECKBOX) {
            return Form::checkbox($this->paramName(), "1", $this->getValue());
        } elseif ($type === self::TYPE_SELECT) {
            return Form::select($this->paramName(), $this->options(), $this->getValue(), ["class" => "select is-fullwidth"]);
        }

        return Form::text($this->paramName(), $this->getValue(), ['class' => 'input']);

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
                "label" => __("Authorizations"),
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
                        "rules" => "min:30|max:100",
                        "default" => "",
                        "type" => DirtikiSetting::TYPE_TEXT,
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
