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

];
