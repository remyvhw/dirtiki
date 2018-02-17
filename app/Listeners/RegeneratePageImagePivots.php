<?php

namespace App\Listeners;

use App\Events\BodySaved;
use App\Image;
use Illuminate\Support\Collection;

class RegeneratePageImagePivots
{

    /**
     * Takes a markdown string and returns a list of all images
     * declarations (such as `![Lorem Ipsum](example.jpg)`).
     *
     * @param string $markdown
     * @return collection
     */
    public function retrieveImageMarkdownOccurences(string $markdown): Collection
    {
        $re = '/\!\[.+\]\([^\s]+\)/';

        preg_match_all($re, $markdown, $matches, PREG_SET_ORDER, 0);
        return collect($matches)->flatten();
    }

    /**
     * Handle the event.
     *
     * @param  BodySaved  $event
     * @return void
     */
    public function handle(BodySaved $event)
    {
        $body = $event->body;

        $imageDeclarations = $this->retrieveImageMarkdownOccurences($body->content);
        collect($imageDeclarations)->map(function ($declaration) {
            preg_match_all('/(?<=\()[^\s]+(?=\))/', $declaration, $matches);
            return array_get($matches, "0.0", null);
        })->filter()->map(function ($url) {
            return data_get(parse_url($url), "path", null);
        })->filter()->map(function ($path) {
            return collect(explode("/", $path))->last();
        })->map(function ($slug) {
            return Image::where("slug", $slug)->first();
        })->filter()->unique()->pipe(function ($images) use ($body) {
            $body->page->images()->sync($images->pluck("id")->toArray());
        });

    }
}
