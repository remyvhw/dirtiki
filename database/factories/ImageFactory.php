<?php

use Faker\Generator as Faker;

$factory->define(App\Image::class, function (Faker $faker) {
    return [
        "slug" => str_slug($faker->unique()->sentence(4, true)),
        "type" => $faker->randomElement(["image/png", "image/jpeg", "image/svg+xml"]),
    ];
});
