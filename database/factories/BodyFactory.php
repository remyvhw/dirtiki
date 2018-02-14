<?php

use Faker\Generator as Faker;

$factory->define(App\Body::class, function (Faker $faker) {
    return [
        "content" => $faker->paragraphs($nb = 3, $asText = true),
    ];
});
