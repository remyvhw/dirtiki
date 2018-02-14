<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * When a Page's slug is modified, a PageRedirection object is automatically
 * generated so the old slug redirects to the new page.
 */
class PageRedirection extends Model
{
    /**
     * Get the page to which we redirect.
     */
    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['slug', 'page_id'];

}
