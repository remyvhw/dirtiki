@extends('layouts.app') @section('content')
<main class="section">



    <section class="container">
    {{ Breadcrumbs::render('login') }}
        <div class="columns">
            <div class="column is-half-desktop is-offset-one-quarter-desktop has-text-centered">
                <h2 class="title is-2">Login</h2>
                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <dirtiki-input 
                        type="email"
                        :should-hard-validate-on-blur="true"
                        :required="true"
                        label="Email" 
                        name="email" 
                        value="{{ old('email') }}"
                        @if ($errors->has('email'))
                        :error-messages="['{{$errors->first('email')}}']"
                        @endif
                        ></dirtiki-input>

                    <dirtiki-input 
                        label="Password" 
                        name="password" 
                        type="password"
                        :required="true"
                        @if ($errors->has('password'))
                        :error-messages="['{{$errors->first('password')}}']"
                        @endif
                        ></dirtiki-input>

                    <div class="field">
  <div class="control">
    <label class="checkbox">
      <input name="remember" type="checkbox" checked>
      Remember Me
    </label>
  </div>
</div>

<div class="field is-grouped">
  <div class="control">
    <button type="submit" class="button is-primary">Login</button>
  </div>
  <div class="control">
    <a href="{{ route('password.request') }}" class="button is-text">Forgot Your Password?</a>
  </div>
</div>

                </form>

            </div>
        </div>
    </section>
</main>
@endsection