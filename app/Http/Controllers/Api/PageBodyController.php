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
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Page  $page
     * @param  \App\Body  $body
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Page $page, Body $body)
    {
        //
    }

}
