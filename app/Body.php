<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Body extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    /**
     * Indicates if the IDs are auto-incrementing. They are not.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * All of the relationships to be touched.
     *
     * @var array
     */
    protected $touches = ['page'];

    /**
     * Get the Page that owns the Body.
     */
    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
