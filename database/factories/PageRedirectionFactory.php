<?php

use Faker\Generator as Faker;

$factory->define(App\PageRedirection::class, function (Faker $faker) {
    return [
        "slug" => str_slug($faker->sentence(4, true)),
    ];
});
