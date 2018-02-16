<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Image extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

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
