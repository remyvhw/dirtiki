<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Page;
use Auth;
use Illuminate\Http\Request;

class PageController extends Controller
{
    protected function getRules()
    {
        return [
            'name' => 'required|max:512',
        ];
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        abort_if(!policy(Page::class)->index(Auth::user()), 403);

        return PageResource::collection(Page::paginate());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        abort_if(!policy(Page::class)->store(Auth::user(), $page), 403);

        $rules = $this->getRules();
        $rules["body.content"] = "required";
        $this->validate($request, $rules);
        $page->create($request->only(["name"]));
        $page->body->update(["content" => $request->input("body.content")]);

    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function show(Page $page)
    {
        abort_if(!policy(Page::class)->view(Auth::user(), $page), 403);
        return new PageResource($page->load(["body"]));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Page $page)
    {
        abort_if(!policy(Page::class)->update(Auth::user(), $page), 403);
        $this->validate($request, $this->getRules());

        $page->update($request->only(["name"]));
        if ($request->has("body")) {
            $page->body->update(["content" => $request->input("body.content")]);
        }

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function destroy(Page $page)
    {
        abort_if(!policy(Page::class)->delete(Auth::user(), $page), 403);
        $page->delete();
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
