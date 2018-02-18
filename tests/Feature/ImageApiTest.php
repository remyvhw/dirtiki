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
     * Create a new image.
     *
     * @return void
     */
    public function testImageCreate()
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

    /**
     * Show an image.
     *
     * @return void
     */
    public function testImageShow()
    {
        $image = Image::latest()->first();
        $response = $this->actingAs(User::inRandomOrder()->first(), 'api')->json('GET', '/api/images/' . $image->slug);

        $response->assertStatus(200)->assertJson([
            'data' => [
                "id" => true,
                "type" => true,
            ],
        ]);

    }

    /**
     * Delete an image
     */
    public function testImageDelete()
    {

        $image = Image::latest()->first();
        $response = $this->actingAs(User::inRandomOrder()->first(), 'api')->json('DELETE', '/api/images/' . $image->slug);

        $response->assertStatus(200);

        Storage::assertMissing($image->getOriginalFilePathAttribute());
    }
}
