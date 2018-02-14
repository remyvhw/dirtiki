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
            'body' => new BodyResource($this->whenLoaded('body')),
        ];
    }
}
