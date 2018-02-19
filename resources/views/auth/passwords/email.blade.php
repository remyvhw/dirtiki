@extends('layouts.app') @section('content')
<main class="section">

    <section class="container">
        {{ Breadcrumbs::render('login') }}
        <div class="columns">
            <div class="column is-half-desktop is-offset-one-quarter-desktop has-text-centered">
                <h2 class="title is-2">Reset Password</h2>

                <form method="POST" action="{{ route('password.email') }}">
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

                        <div class="field">
                                <p class="control">
                                    <button type="submit" class="button is-primary">
                                            Send Password Reset Link
                                    </button>
                                </p>
                            </div>


                </form>
            </div>
        </div>
        </div>
        </div>
        </div>
        @endsection