<?php

namespace App;

use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Page extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use Sluggable;
    use SoftDeletes;

    /**
     * Return the sluggable configuration array for this model.
     *
     * @return array
     */
    public function sluggable()
    {
        return [
            'slug' => [
                'source' => 'name',
                'maxLength' => 512,
                'onUpdate' => true,
                'unique' => true,
            ],
        ];
    }

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
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the Body record associated with the Page.
     */
    public function body()
    {
        return $this->hasOne(Body::class)->withDefault();
    }

    /**
     * Get the redirections for the page.
     */
    public function pageRedirections()
    {
        return $this->hasMany(PageRedirection::class);
    }

}
