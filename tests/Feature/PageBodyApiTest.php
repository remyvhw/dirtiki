<?php

namespace Tests\Feature;

use App\Page;
use App\User;
use Faker\Factory as Faker;
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
                        "name",
                        "id",
                        "slug",
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

    /**
     * Retrieve a given page's Body.
     *
     * @return void
     */
    public function testBodyShow()
    {
        $page = Page::inRandomOrder()->first();
        $response = $this->actingAs(User::inRandomOrder()->first(), 'api')->json('GET', "/api/pages/{$page->slug}/body");
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    "type",
                    "content",
                ],
                'links' => [
                    "self",
                ],
                'relationships' => [
                    "page" => [
                        "links" => [
                            "self",
                        ],
                        "data" => [
                            "id",
                            "name",
                            "slug",
                        ],
                    ],

                ],
            ]);
    }

    /**
     * Create a new page and body.
     *
     * @return void
     */
    public function testPageCreate()
    {
        $faker = Faker::create();
        $response = $this
            ->actingAs(User::inRandomOrder()->first(), 'api')
            ->withHeaders([
                "User-Agent" => $faker->userAgent(),
            ])
            ->json('POST', "/api/pages/", [
                "data" => [
                    "name" => $faker->sentence(4, true),
                ],
                "relationships" => [
                    "body" => [
                        "data" => [
                            "content" => $faker->paragraphs(4, true),
                        ],
                    ],
                ],
            ]);
        $response
            ->assertStatus(201);
    }

    /**
     * Update a given page.
     *
     * @return void
     */
    public function testPageUpdate()
    {
        $faker = Faker::create();
        $page = Page::inRandomOrder()->first();
        $response = $this
            ->actingAs(User::inRandomOrder()->first(), 'api')
            ->withHeaders([
                "User-Agent" => $faker->userAgent(),
            ])
            ->json('PUT', "/api/pages/" . $page->slug, [
                "data" => [
                    "name" => $faker->sentence(4, true),
                ],
                "relationships" => [
                    "body" => [
                        "data" => [
                            "content" => $faker->paragraphs(4, true),
                        ],
                    ],
                ],
            ]);
        $response
            ->assertStatus(200);
    }

    /**
     * Delete a given page.
     *
     * @return void
     */
    public function testPageDelete()
    {
        $faker = Faker::create();
        $page = Page::inRandomOrder()->first();
        $response = $this
            ->actingAs(User::where("admin", true)->inRandomOrder()->first(), 'api')
            ->withHeaders([
                "User-Agent" => $faker->userAgent(),
            ])
            ->json('DELETE', "/api/pages/" . $page->slug);
        $response
            ->assertStatus(200);
    }
}
