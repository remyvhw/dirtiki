<?php

namespace App\Policies;

use App\Image;
use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ImagePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view a list of images.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function index(?User $user)
    {
        if (!$user && !config("dirtiki.allow_anonymous.views")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can view the image.
     *
     * @param  \App\User  $user
     * @param  \App\Image  $image
     * @return mixed
     */
    public function view(?User $user, Image $image)
    {
        if (!$user && !config("dirtiki.allow_anonymous.views")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can create images.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function create(?User $user)
    {
        if (!$user && !config("dirtiki.allow_anonymous.updates")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can update the image.
     *
     * @param  \App\User  $user
     * @param  \App\Image  $image
     * @return mixed
     */
    public function update(?User $user, Image $image)
    {
        if (!$user && !config("dirtiki.allow_anonymous.updates")) {
            return false;
        }
        return true;
    }

    /**
     * Determine whether the user can delete the image.
     *
     * @param  \App\User  $user
     * @param  \App\Image  $image
     * @return mixed
     */
    public function delete(?User $user, Image $image)
    {
        if (!$user && !config("dirtiki.allow_anonymous.updates")) {
            return false;
        }
        return true;
    }
}
