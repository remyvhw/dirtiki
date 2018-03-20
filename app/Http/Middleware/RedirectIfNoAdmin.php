<?php

namespace App\Http\Middleware;

use App\User;
use Cache;
use Closure;

class RedirectIfNoAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (!self::adminsAreAlreadySet()) {
            return redirect(route("register"));
        }
        return $next($request);
    }

    /**
     * If application's admin is already created.
     *
     * @return bool
     */
    public static function adminsAreAlreadySet()
    {
        return Cache::rememberForever('config:has-admin', function () {
            return User::where("admin", true)->exists();
        });
    }
}
