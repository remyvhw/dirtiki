<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\AccountCreated;
use App\Rules\MustEndWith;
use App\Rules\Recaptcha;
use App\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Setting;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
     */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, collect([
            'name' => 'required|string|max:255',
            'email' => collect(['required', 'string', 'email', 'max:255', 'unique:users'])
                ->when(Setting::get('users.signup_domains', false), function ($collection) {
                    $collection->push(new MustEndWith(Setting::get('users.signup_domains', "")));
                    return $collection;
                })
                ->toArray(),
            'password' => 'required|string|min:6|confirmed',
        ])->when(Setting::get('captcha.provider') === 'recaptcha', function ($collection) {
            $collection->put('g-recaptcha-response', new Recaptcha());
            return $collection;
        })
                ->toArray());
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(array $data)
    {
        $user = new User([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if (!\App\Http\Middleware\RedirectIfNoAdmin::adminsAreAlreadySet()) {
            $user->admin = true;
            $user->save();
        } else {
            if (!Setting::get("users.allow_signups", false)) {
                abort(403);
            }
        }
        $user->save();

        $user->notify(new AccountCreated());

        return $user;
    }
}
