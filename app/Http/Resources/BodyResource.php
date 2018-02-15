<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BodyResource extends JsonResource
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
            "type" => $this->type,
            "content" => $this->content,
            'page' => new PageResource($this->whenLoaded('page')),
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
        return [
            'links' => [
                'self' => route("api.pages.body.show", ["page" => $this->page]),
            ],
            'relationships' => [
                'page' => [
                    'links' => [
                        'self' => route("api.pages.show", ["page" => $this->page]),
                    ],
                    'data' => new PageResource($this->whenLoaded('page')),
                ],
            ],
        ];
    }
}
