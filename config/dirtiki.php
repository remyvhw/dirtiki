<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Anonymous
    |--------------------------------------------------------------------------
    |
    | Here you may specify if anonymous users are allowed to view, edit,
    | create or delete Pages.
    |
    |
     */

    'allow_anonymous' => [
        "views" => env('ALLOW_ANONYMOUS_VIEWS', true),
        "updates" => env('ALLOW_ANONYMOUS_UPDATES', true),
        "creates" => env('ALLOW_ANONYMOUS_CREATES', false),
        "deletes" => env('ALLOW_ANONYMOUS_DELETES', false),
    ],

];
