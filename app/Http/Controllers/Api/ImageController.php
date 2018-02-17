<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImageResource;
use App\Image;
use Auth;
use Illuminate\Http\Request;

class ImageController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        abort_if(!policy(Image::class)->index(Auth::user()), 403);
        return ImageResource::collection(Image::paginate());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        abort_if(!policy(Image::class)->create(Auth::user()), 403);
        $this->validate($request, [
            "image" => "image",
        ]);

        $file = $request->file("image");
        $image = new Image;
        $image->name = $file->getClientOriginalName() ?? str_random(32);
        $image->type = $file->getMimeType();
        $image->save();

        $file->storeAs($image->getFilePrefixAttribute(), "source");
        return new ImageResource($image);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Image  $image
     * @return \Illuminate\Http\Response
     */
    public function show(Image $image)
    {
        abort_if(!policy(Image::class)->view(Auth::user(), $image), 403);
        return new ImageResource($image);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Image  $image
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Image $image)
    {
        abort(405);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Image  $image
     * @return \Illuminate\Http\Response
     */
    public function destroy(Image $image)
    {
        abort_if(!policy(Image::class)->delete(Auth::user(), $image), 403);
        $image->delete();
    }
}
