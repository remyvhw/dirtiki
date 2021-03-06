@extends('layouts.app') 
@section('content')

<main class="section">
    <section class="container">
    {{ Breadcrumbs::render('register') }}
        <div class="columns">
            <div class="column is-half-desktop is-offset-one-quarter-desktop has-text-centered">
                <h2 class="title is-2">Register</h2>
                @if (!\App\Http\Middleware\RedirectIfNoAdmin::adminsAreAlreadySet())
                <div class="notification is-info">Thanks for installing Dirtiki! This first account will become the <em>de facto</em> admin.</div>
                @endif

                <register-form inline-template>
                <form method="POST" action="{{ route('register') }}">
                    @csrf

                    <dirtiki-input :should-hard-validate-on-blur="true" :required="true" label="Name" name="name" value="{{ old('name') }}"  
                    @if ($errors->has('name'))
                     :error-messages="['{{$errors->first('name')}}']" 
                    @endif
                    >
                    </dirtiki-input>

                    <dirtiki-input type="email" :should-hard-validate-on-blur="true"  :required="true"  label="Email address" name="email" value="{{ old('email') }}"
                        @if ($errors->has('email')) 
                        :error-messages="['{{$errors->first('email')}}']" 
                        @endif
                        
                        @if (Setting::get('users.signup_domains', null))
                            :must-end-with='{!! (new App\Rules\MustEndWith(Setting::get('users.signup_domains')))->validEnds->toJson() !!}'
                        @endif
                        >
                    </dirtiki-input>

                    <dirtiki-input label="Password" name="password"  :required="true"  type="password"
                    @if ($errors->has('password')) 
                    :error-messages="['{{$errors->first('password')}}']"
                     @endif >
                    </dirtiki-input>

                    <dirtiki-input label="Confirm Password" name="password_confirmation"  :required="true"  type="password" 
                    @if ($errors->has('password_confirmation')) 
                    :error-messages="['{{$errors->first('password_confirmation')}}']" 
                    @endif >
                    </dirtiki-input>

                    <div class="field">
                        <p class="control">
                            @if (Setting::get("captcha.require_on_signup") && Setting::get("captcha.provider") === "recaptcha")
                                <recaptcha-button @complete="submit" public-key="{{ Setting::get('captcha.public_key') }}">Register</recaptcha-button>
                            @else
                            <button @click.prevent="submit" class="button is-primary">
                                Register
                            </button>
                            @endif
                        </p>
                    </div>


                </form>
                </register-form>

            </div>
        </div>
    </section>
</main>
@endsection
@section("scripts")
@if (Setting::get("captcha.require_on_signup") && Setting::get("captcha.provider") === "recaptcha")
    <script src="https://www.google.com/recaptcha/api.js?onload=recaptchaOnloadCallback&render=explicit" async defer></script>
@endif
@endsection