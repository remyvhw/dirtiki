<?php

namespace App\Listeners;

use App\Events\ImageDeleted;
use App\Image;
use Illuminate\Contracts\Queue\ShouldQueue;
use Storage;

class CleanDeletedImageFolder implements ShouldQueue
{

    /**
     * Handle the event.
     *
     * @param  ImageDeleted  $event
     * @return void
     */
    public function handle(ImageDeleted $event)
    {
        Storage::deleteDirectory(Image::filePrefixForId($event->imageId));
        dump("Deleted!");
    }
}
