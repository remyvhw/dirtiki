<?php

namespace App\Http\Controllers\Api;

use App\Body;
use App\Http\Controllers\Controller;
use App\Page;
use Illuminate\Http\Request;

class PageBodyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function index(Page $page)
    {
        abort_if(!policy(Page::class)->view(Auth::user(), $page), 403);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Page  $page
     * @param  \App\Body  $body
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Page $page)
    {
        abort_if(!policy(Page::class)->update(Auth::user(), $page), 403);
    }

    /**
     * List audited changes to a given resource.
     *
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function getHistory(Page $page)
    {
        abort_if(!policy(Page::class)->view(Auth::user(), $page), 403);

    }

}
