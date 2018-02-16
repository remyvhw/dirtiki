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

            if ($faker->boolean()) {
                $image = App\Image::inRandomOrder()->first();
                $content = $page->body->content;
                preg_match_all('/\.[a-zA-Z\ ]+\./i', $content, $matches);
                $sentence = $faker->randomElement($matches[0]);
                $replacement = $sentence . "\n\n![" . $faker->sentence() . "](" . route("images.show", ["image" => $image], false) . ")\n\n";
                $page->body->content = str_replace($sentence, $replacement, $content);
                $page->body->save();
            }

            factory(App\PageRedirection::class, $faker->numberBetween(0, 100))->make()->each(function ($redirection) use ($page) {
                $page->pageRedirections()->save($redirection);
            });

        });
    }
}
