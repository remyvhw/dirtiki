<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuditResource extends JsonResource
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
            "data" => [
                "created_at" => $this->created_at,
                "changes" => [
                    "before" => $this->old_values,
                    "after" => $this->new_values,
                ],
                "author" => [
                    "ip" => $this->ip_address,
                    "user_agent" => $this->user_agent,
                    "anomymous" => !$this->user_id,
                ],
            ],
            'relationships' => [
                'user' => $this->when($this->user_id, function () {
                    return [
                        'links' => [
                            'self' => "#",
                        ],
                        'data' => new UserResource($this->user),
                        "meta" => [
                            "role" => "Author",
                        ],
                    ];
                }),
            ],
        ];
    }

}
