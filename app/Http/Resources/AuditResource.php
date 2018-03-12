<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use SebastianBergmann\Diff\Differ;

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
        $audit = $this;
        return [
            "data" => [
                "key" => md5($this->toJson()),
                "created_at" => $this->created_at,
                "type" => $this->event,
                "changes" => [
                    "before" => $this->old_values,
                    "after" => $this->new_values,
                    "diff" => $this->when($this->auditable_type === \App\Body::class && data_get($this->old_values, "content"), function () use ($audit) {
                        $differ = new Differ;
                        return $differ->diff(data_get($audit->old_values, "content"), data_get($audit->new_values, "content"));;
                    }),
                ],
                "author" => [
                    "ip" => $this->ip_address,
                    "user_agent" => $this->user_agent,
                    "anonymous" => !$this->user_id,
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
