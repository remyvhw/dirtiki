<?php

namespace App\Settings;

use Form;
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
        if (!$value) {
            $value = "";
        }
        $group = $this->group();
        array_set($group, $this->groupLessKey(), $value);
        Setting::set($this->groupName(), $group);
    }

    public function __toString(): string
    {
        return collect($this)->toJson();
    }

}
