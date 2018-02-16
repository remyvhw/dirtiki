<?php

use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class ImagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();
        factory(App\Image::class, 25)->create()->each(function ($image) use ($faker) {

            /**
             * We will use a different source for every image type.
             * If you're looking for a hobby project, build a PHP
             * random image generator that support these types.
             */
            $width = $faker->biasedNumberBetween($min = 100, $max = 1000);
            $height = $faker->biasedNumberBetween($min = 100, $max = 1000);
            if ($image->type === "image/svg+xml") {
                $color1 = str_after($faker->hexcolor(), "#");
                $color2 = str_after($faker->hexcolor(), "#");
                $url = "https://placeholder.pics/svg/{$width}x{$height}/{$color1}-{$color2}";
            } elseif ($image->type === "image/png" && $faker->boolean()) {
                // Use two services so png are not too boring...
                $identifier = md5($width . $height);
                $url = "https://api.adorable.io/avatars/285/{$identifier}.png";
            } elseif ($image->type === "image/png") {
                $color = str_after($faker->hexcolor(), "#");
                $url = "https://via.placeholder.com/{$width}x{$height}/{$color}.png";
            } elseif ($image->type === "image/jpeg") {
                $url = $faker->imageUrl($width = $width, $height = $height);
            }
            $content = file_get_contents($url);
            Storage::put($image->getOriginalFilePathAttribute(), $content);
        });
    }
}
