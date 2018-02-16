<?php

namespace Tests\Feature;

use App\Page;
use App\User;
use Tests\TestCase;

class PageBodyApiTest extends TestCase
{
    /**
     * Retrieve the pages index test.
     *
     * @return void
     */
    public function testPageIndex()
    {
        $response = $this->actingAs(User::inRandomOrder()->first(), 'api')->json('GET', '/api/pages');
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'meta',
                'links',
                'data' => [
                    '*' => [
                        'data' => [
                            "name",
                            "id",
                            "slug",
                        ],
                    ],
                ],
            ]);
    }

    /**
     * Retrieve a given page.
     *
     * @return void
     */
    public function testPageShow()
    {
        $page = Page::inRandomOrder()->first();
        $response = $this->actingAs(User::inRandomOrder()->first(), 'api')->json('GET', '/api/pages/' . $page->slug);
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    "name",
                    "id",
                    "slug",
                ],
                'links' => [
                    "self",
                ],
                'relationships' => [
                    "body" => [
                        "links" => [
                            "self",
                        ],
                        "data" => [
                            "type",
                            "content",
                        ],
                    ],

                ],
            ]);
    }
}
