<?php

namespace App\Providers;

use App\Observers\PageObserver;
use App\Page;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'App\Events\ImageDeleted' => [
            'App\Listeners\CleanDeletedImageFolder',
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();
        Page::observe(PageObserver::class);

    }
}
