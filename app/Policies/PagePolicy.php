<?php

namespace App\Policies;

use App\Page;
use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PagePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the page.
     *
     * @param  \App\User  $user
     * @param  \App\Page  $page
     * @return mixed
     */
    public function index(?User $user): bool
    {
        if (!$user && !config("dirtiki.allow_anonymous.views")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can view the page.
     *
     * @param  \App\User  $user
     * @param  \App\Page  $page
     * @return mixed
     */
    public function view(?User $user, Page $page): bool
    {
        if (!$user && !config("dirtiki.allow_anonymous.views")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can create pages.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function store(?User $user): bool
    {
        if (!$user && !config("dirtiki.allow_anonymous.stores")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can update the page.
     *
     * @param  \App\User  $user
     * @param  \App\Page  $page
     * @return mixed
     */
    public function update(?User $user, Page $page): bool
    {
        if (!$user && !config("dirtiki.allow_anonymous.updates")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can delete the page.
     *
     * @param  \App\User  $user
     * @param  \App\Page  $page
     * @return mixed
     */
    public function delete(?User $user, Page $page): bool
    {
        if (!$user && !config("dirtiki.allow_anonymous.deletes")) {
            return false;
        }
        return true;
    }
}
