<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VerifyController extends Controller
{
    /**
     * Verify a given user.
     *
     * @return \Illuminate\Http\Response
     */
    public function getVerify(Request $request, User $user)
    {
        if (!$request->hasValidSignature()) {
            abort(401);
        }
        if (!$user->verified) {
            $user->verified = now();
            $user->save();
            $request->session()->flash('status', __("Congratulations, your account has been successfully verified."));
        }
        return redirect()->route(Auth::check() ? "home" : "login");
    }
}
