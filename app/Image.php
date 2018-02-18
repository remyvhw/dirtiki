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
     * An array of variations allowed when serving an image.
     */
    const ALLOWED_VARIATION_PARAMETERS = ["width", "height", "fit"];

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
    public function pages()
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
     * Given an array of parameters, generate a hash.
     *
     * @param array $parameters
     * @return string
     */
    public static function storageHashForParameters(array $parameters): string
    {
        return collect($parameters)->sortBy(function ($value, $parameter) {
            return $parameter;
        })->unique()->map(function ($value, $parameter) {
            return $value . $parameter;
        })->pipe(function ($collection) {
            return md5($collection->implode(","));
        });
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

    /**
     * Retrieve the storage path of a given image variation.
     *
     * @param array $parameters anything like ["width"=>123, "height"=>456]
     * @return string
     */
    public function getFilePathAttribute(array $parameters): string
    {
        if ($this->type === "image/svg+xml") {
            return $this->getOriginalFilePathAttribute();
        }

        return $this->getFilePrefixAttribute() . self::storageHashForParameters($parameters);
    }

}
