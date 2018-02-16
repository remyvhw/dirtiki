<?php

namespace App\Events;

use App\Image;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ImageDeleted
{
    use Dispatchable, SerializesModels;

    public $imageId;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Image $image)
    {
        $this->imageId = $image->id;
    }

}
