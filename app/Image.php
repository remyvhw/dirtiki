<?php

namespace App;

use App\Events\ImageDeleted;
use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Image extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use Sluggable;

    /**
     * A name that will not be saved but used by the sluggable
     * trait to generate a unique slug.
     *
     * @var string
     */
    public $name;

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
                'unique' => true,
            ],
        ];
    }

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

    /**
     * Retrieve the directory in which all versions and source of the
     * image will be saved, for any given model id.
     *
     * @return string
     */
    public static function filePrefixForId(string $id): string
    {
        return "images/" . $id . "/";
    }

    /**
     * Retrieve the directory in which all versions and source of the
     * image will be saved.
     *
     * @return string
     */
    public function getFilePrefixAttribute(): string
    {
        return self::filePrefixForId($this->id);
    }

    /**
     * Retrieve the original image file path, so it can
     * be used in conjonction with Storage;
     *
     * @return string
     */
    public function getOriginalFilePathAttribute(): string
    {
        return $this->getFilePrefixAttribute() . "source";
    }

}
