<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Get the Body record associated with the Page.
     */
    public function body()
    {
        return $this->hasOne(Body::class)->withDefault();
    }

    /**
     * Get the redirections for the page.
     */
    public function pageRedirections()
    {
        return $this->hasMany(PageRedirection::class);
    }

}
