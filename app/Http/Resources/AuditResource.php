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
                "key" => md5($this->toJson()),
                "created_at" => $this->created_at,
                "type" => $this->event,
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
                            'self' => route("api.users.show", ["user" => $this->user]),
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
