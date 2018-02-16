<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * The pages that belong to the image.
     */
    public function images()
    {
        return $this->belongsToMany(Page::class);
    }
}
