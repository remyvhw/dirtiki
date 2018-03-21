<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SettingController extends Controller
{

    public function getEdit(Request $request, string $group)
    {
        $this->authorize("update-settings");

    }

    public function postUpdate(Request $request, string $group)
    {
        $this->authorize("update-settings");
    }
}
