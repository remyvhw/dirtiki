<?php

namespace App\Http\Controllers\Api;

use App\Body;
use App\Http\Controllers\Controller;
use App\Http\Resources\BodyResource;
use App\Page;
use Auth;
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
        return new BodyResource($page->body);
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
        $this->validate($request, [
            'content' => 'required',
        ]);
        $page->body->update($request->only(["content"]));
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
