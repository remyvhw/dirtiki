<?php

use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();

        factory(App\Page::class, 50)->create()->each(function ($page) use ($faker) {
            $page->body()->save(factory(App\Body::class)->make());

            factory(App\PageRedirection::class, $faker->numberBetween(0, 100))->make()->each(function ($redirection) use ($page) {
                $page->pageRedirections()->save($redirection);
            });

        });
    }
}
