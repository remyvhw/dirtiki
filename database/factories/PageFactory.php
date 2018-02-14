<?php

use Faker\Generator as Faker;

$factory->define(App\Page::class, function (Faker $faker) {
    $name = $faker->sentence(4, true);
    return [
        "name" => $name,
        "slug" => str_slug($name),
        "archived_at" => $faker->boolean(10) ? $faker->dateTime() : null,
    ];
});
