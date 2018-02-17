<?php

namespace App\Events;

use App\Body;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BodySaved
{
    use Dispatchable, SerializesModels;
    public $body;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Body $body)
    {
        $this->body = $body;
    }

}
