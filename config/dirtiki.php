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
        "stores" => env('ALLOW_ANONYMOUS_STORES', false),
        "deletes" => env('ALLOW_ANONYMOUS_DELETES', false),
    ],

];
