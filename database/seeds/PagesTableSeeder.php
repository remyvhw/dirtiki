<?php

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
        factory(App\Page::class, 50)->create()->each(function ($page) {
            $page->body()->save(factory(App\Body::class)->make());
        });
    }
}
