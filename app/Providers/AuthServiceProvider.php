<?php

namespace App\Providers;

use Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        \App\Page::class => \App\Policies\PagePolicy::class,
        \App\User::class => \App\Policies\UserPolicy::class,
        \App\Image::class => \App\Policies\ImagePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define('update-settings', function ($user) {
            return (bool) $user->admin;
        });
    }
}
