<?php

namespace App\Http\Controllers\Api;

use App\Image;
use App\Page;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PageImageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function index(Page $page)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Page $page)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Page  $page
     * @param  \App\Image  $image
     * @return \Illuminate\Http\Response
     */
    public function show(Page $page, Image $image)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Page  $page
     * @param  \App\Image  $image
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Page $page, Image $image)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Page  $page
     * @param  \App\Image  $image
     * @return \Illuminate\Http\Response
     */
    public function destroy(Page $page, Image $image)
    {
        //
    }
}
