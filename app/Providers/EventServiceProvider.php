<?php

namespace App\Providers;

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
        'App\Events\PageSaved' => [
            'App\Listeners\GeneratePageRedirections',
        ],
        'App\Events\BodySaved' => [
            'App\Listeners\RegeneratePageImagePivots',
        ],
        'App\Events\UserCreated' => [
            'App\Listeners\UpdateAdminCreatedStatus',
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

    }
}
