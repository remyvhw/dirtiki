<?php

namespace App\Policies;

use App\Image;
use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Setting;

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
        if (!$user && !Setting::get("permissions.public_read")) {
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
        if (!$user && !Setting::get("permissions.public_read")) {
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
        if (!$user && !Setting::get("permissions.public_create")) {
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
        if (!$user && !Setting::get("permissions.public_update")) {
            return false;
        }
        return true;
    }
}
