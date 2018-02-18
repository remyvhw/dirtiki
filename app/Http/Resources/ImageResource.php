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

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @param \Illuminate\Http\Request  $request
     * @return array
     */
    public function with($request)
    {

        $pages = $this->pages->map(function ($page) {
            return [
                'links' => [
                    'self' => route("api.pages.show", ["page" => $page]),
                ],
                'data' => new PageResource($page),
            ];
        })->toArray();

        return [
            'links' => [
                'self' => route("api.images.show", ["image" => $this]),
            ],
            'relationships' => [
                'pages' => $pages,
            ],
        ];
    }
}
