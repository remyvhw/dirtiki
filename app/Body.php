<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Body extends Model
{
    /**
     * Get the Page that owns the Body.
     */
    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
