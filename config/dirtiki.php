<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Images
    |--------------------------------------------------------------------------
    |
    | You will find here anything related to images.
    |
    |
     */

    'images' => [
        /**
         * Images that are uploaded need to be processed before being
         * served (eg.: generate thumbnails). Imagick is the
         * recommended processor but `gd` is also supported.
         */
        "processor" => env('IMAGE_PROCESSOR', "imagick"),
        "presets" => [
            ["width" => 250, "height" => 250, "fit" => "center"],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Markdown Rendering
    |--------------------------------------------------------------------------
    |
    | Anything related to markdown rendering.
    |
    |
     */
    'rendering' => [
        /**
         * Used to render geojson code.
         * Provider can either be `google` or `mapbox`.
         */
        "maps" => [
            "provider" => env('RENDERING_MAPS_PROVIDER', null),
            "key" => env('RENDERING_MAPS_KEY', null),
        ],
    ],

];
