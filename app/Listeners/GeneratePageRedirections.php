<?php

namespace App\Listeners;

use App\Events\PageSaved;
use App\Page;
use App\PageRedirection;

class GeneratePageRedirections
{
    /**
     * Handle the event.
     *
     * @param  PageSaved  $event
     * @return void
     */
    public function handle(PageSaved $event)
    {
        $page = $event->page;
        $originalSlug = $page->getOriginal('slug');
        $newSlug = $page->slug;
        if (PageRedirection::where("slug", $newSlug)->exists()) {
            /*
             * A redirection exists for a given slug.
             */
            PageRedirection::where("slug", $newSlug)->delete();
        }

        if ($originalSlug && $originalSlug != $newSlug) {
            /*
             * A page slug was updated. We'll create a Page Redirection so the old
             * link still works.
             */
            PageRedirection::create(['slug' => $originalSlug, "page_id" => $page->id]);
        }
    }
}
