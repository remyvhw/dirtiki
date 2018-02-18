<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $image = $this;
        $variations = collect(config("dirtiki.images.presets"))->map(function ($preset) use ($image) {
            $preset["url"] = route("images.show", array_merge(["image" => $image], $preset), false);
            return $preset;
        })->toArray();

        return [
            "id" => $this->id,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "type" => $this->type,
            "variations" => $variations,
        ];
    }
}
