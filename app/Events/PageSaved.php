<?php

namespace App\Events;

use App\Page;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PageSaved
{
    use Dispatchable, SerializesModels;

    public $page;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Page $page)
    {
        $this->page = $page;
    }

}
