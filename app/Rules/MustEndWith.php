<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Collection;

class MustEndWith implements Rule
{
    public $validEnds;

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($validEnds)
    {
        if (gettype($validEnds) === "string") {
            $validEnds = preg_replace('/\s+/', '', $validEnds);
            $validEnds = explode(',', $validEnds);
        }

        if (gettype($validEnds) === "array") {
            $validEnds = collect($validEnds);
        }

        if (gettype($validEnds) != "object" || get_class($validEnds) !== Collection::class) {
            throw new \InvalidArgumentException("MustEndWith constructor only accepts comma separated strings, arrays and Collections.");
        }

        $this->validEnds = $validEnds;

    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        return $this->validEnds->contains(function ($end) use ($value) {
            return ends_with($value, $end);
        });
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return trans('validation.must_end_with', ['end' => $this->validEnds->implode(", ")]);
    }
}
