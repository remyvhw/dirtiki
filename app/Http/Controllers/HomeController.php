<?php

namespace App\Http\Controllers;

use App\Page;
use Setting;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        if (!Setting::get("permissions.public_read")) {
            $this->middleware('auth');
        }

    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {

        $pages = Page::whereNull("archived_at")->orderBy("name")->get();
        return view('pages.index', compact("pages"));
    }
}
