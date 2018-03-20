<?php

namespace App\Listeners;

use App\Events\UserCreated;
use Cache;

class UpdateAdminCreatedStatus
{

    /**
     * Handle the event.
     *
     * @param  UserCreated  $event
     * @return void
     */
    public function handle(UserCreated $event)
    {
        if (!$event->user->admin) {
            return;
        }

        if (\App\Http\Middleware\RedirectIfNoAdmin::adminsAreAlreadySet()) {
            return;
        }

        Cache::forget('config:has-admin');
    }
}
