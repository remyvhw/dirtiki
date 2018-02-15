<?php

namespace App\Observers;

use App\Page;
use App\PageRedirection;

class PageObserver
{

    /**
     * Handle anything related to slugs and redirections of Pages.
     * #TODO We might have to split this into another model at some point.
     *
     * @param Page $page
     * @return void
     */
    protected function handleSlugSavingMethods(Page $page)
    {

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

    public function saving(Page $page)
    {
        $this->handleSlugSavingMethods($page);
    }
}
