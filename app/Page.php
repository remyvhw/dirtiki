<?php

namespace App;

use App\Events\PageSaved;
use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use OwenIt\Auditing\Contracts\Auditable;

class Page extends Model implements Auditable
{
    use Searchable;
    use \OwenIt\Auditing\Auditable;
    use Sluggable;
    use SoftDeletes;

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'saved' => PageSaved::class,
    ];

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
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "slug" => $this->slug,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "archived_at" => $this->archived_at,
            "body" => [
                "content" => $this->body->content,
            ],
            "links" => [
                "api" => route("api.pages.show", [$this]),
                "public" => route("pages.show", [$this]),
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
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [];

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

    /**
     * The images that belong to the page.
     */
    public function images()
    {
        return $this->belongsToMany(Image::class);
    }

}
