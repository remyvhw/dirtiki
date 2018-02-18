<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            "id" => $this->id,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "archived_at" => $this->archived_at,
            "name" => $this->name,
            "slug" => $this->slug,

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
        $images = $this->images->map(function ($image) {
            return [
                'links' => [
                    'self' => route("api.images.show", ["image" => $image]),
                ],
                'data' => new ImageResource($image),
            ];
        })->toArray();
        return [
            'links' => [
                'self' => route("api.pages.show", ["page" => $this]),
            ],
            'relationships' => [
                'body' => [
                    'links' => [
                        'self' => route("api.pages.body.show", ["page" => $this]),
                    ],
                    'data' => new BodyResource($this->whenLoaded('body')),
                ],
                'images' => $images,
            ],
        ];
    }
}
