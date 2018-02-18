<?php

namespace App\Jobs;

use App\Image;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Intervention\Image\ImageManager;
use Storage;

class GenerateImageVariation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $image;
    public $parameters;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Image $image, array $parameters)
    {
        $this->image = $image;
        $this->parameters = $parameters;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $manager = new ImageManager(['driver' => config("dirtiki.images.processor")]);
        $interventionImage = $manager->make(Storage::get($this->image->getOriginalFilePathAttribute()));

        if (!array_get($this->parameters, "fit", false) && (array_has($this->parameters, "width") || array_has($this->parameters, "height"))) {
            $interventionImage->resize(array_get($this->parameters, "width"), array_get($this->parameters, "height"), function ($constraint) {
                $constraint->aspectRatio();
            });
        } elseif (array_get($this->parameters, "fit", false) && (array_has($this->parameters, "width") || array_has($this->parameters, "height"))) {
            $interventionImage->fit(array_get($this->parameters, "width"), array_get($this->parameters, "height"), null, array_get($this->parameters, "fit", "center"));
        }

        Storage::put($this->image->getFilePathAttribute(collect($this->parameters)->only(Image::ALLOWED_VARIATION_PARAMETERS)->toArray()), $interventionImage->encode());
    }
}
