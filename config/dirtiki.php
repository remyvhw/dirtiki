<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Anonymous edits
    |--------------------------------------------------------------------------
    |
    | Here you may specify if anonymous users are allowed to edit or create
    | Pages.
    |
     */

    'allow_anonymous' => [
        "edits" => env('ALLOW_ANONYMOUS_UPDATED', false),
        "creates" => env('ALLOW_ANONYMOUS_UPDATED', false),
    ],

];
