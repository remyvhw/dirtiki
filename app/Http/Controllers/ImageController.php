<?php

namespace App\Http\Controllers;

use App\Image;
use Auth;
use Illuminate\Http\Request;
use Storage;

class ImageController extends Controller
{

    public function getShow(Request $request, Image $image)
    {
        abort_if(!policy(Image::class)->view(Auth::user(), $image), 403);
        $path = $image->getFilePathAttribute(Image::ALLOWED_VARIATION_PARAMETERS);

        if (!Storage::exists($image->getFilePathAttribute(Image::ALLOWED_VARIATION_PARAMETERS))) {

        }

        return response(Storage::get($path))
            ->withHeaders([
                'Content-Type' => $image->type,
            ]);
    }

}
