<?php

namespace Tests\Feature;

use App\Image;
use App\User;
use Faker\Factory as Faker;
use Illuminate\Http\UploadedFile;
use Storage;
use Tests\TestCase;

class ImageApiTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function testExample()
    {
        $faker = Faker::create();
        $response = $this->actingAs(User::inRandomOrder()->first(), 'api')->json('POST', '/api/images/', [
            'image' => UploadedFile::fake()->image($faker->slug() . ".jpg"),
        ]);

        $response->assertStatus(201)->assertJson([
            'data' => [
                "id" => true,
            ],
        ]);
        $image = Image::find(data_get($response->json(), "data.id"));
        Storage::assertExists($image->getOriginalFilePathAttribute());

    }
}
