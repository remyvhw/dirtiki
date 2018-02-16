<?php

namespace App\Listeners;

use App\Events\ImageDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;

class CleanDeletedImageFolder implements ShouldQueue
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  ImageDeleted  $event
     * @return void
     */
    public function handle(ImageDeleted $event)
    {
        //
    }
}
