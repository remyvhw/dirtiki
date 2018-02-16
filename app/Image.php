<?php

namespace App;

use App\Events\ImageDeleted;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Image extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'deleted' => ImageDeleted::class,
    ];

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
