@extends('layouts.app')
@section('content')
<main class="section">

    <section class="container">
        {{ Breadcrumbs::render('login') }}
        <div class="columns">
            <div class="column is-half-desktop is-offset-one-quarter-desktop has-text-centered">
                <h2 class="title is-2">Reset Password</h2>
                <form method="POST" action="{{ route('password.request') }}">
                    @csrf
                    <input type="hidden" name="token" value="{{ $token }}">

                    <dirtiki-input 
                        type="email"
                        :should-hard-validate-on-blur="true"
                        :required="true"
                        label="Email"
                        name="email" 
                        value="{{ $email or old('email') }}"
                        @if ($errors->has('email'))
                        :error-messages="['{{$errors->first('email')}}']"
                        @endif
                        ></dirtiki-input>

                        <dirtiki-input 
                        label="New password" 
                        name="password" 
                        type="password"
                        :required="true"
                        @if ($errors->has('password'))
                        :error-messages="['{{$errors->first('password')}}']"
                        @endif
                        ></dirtiki-input>

                        <dirtiki-input 
                        label="Confirm Password" 
                        name="password_confirmation" 
                        type="password"
                        :required="true"
                        @if ($errors->has('password_confirmation'))
                        :error-messages="['{{$errors->first('password_confirmation')}}']"
                        @endif
                        ></dirtiki-input>


                        <div class="field">
                                <p class="control">
                                    <button type="submit" class="button is-primary">
                                        Reset Password
                                    </button>
                                </p>
                            </div>
                </form>

            </div>
        </div>
    </section>
</main>
@endsection