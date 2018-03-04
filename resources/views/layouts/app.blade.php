<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>@yield('title', config("app.name"))</title>

        <!-- Styles -->
        <link href="https://use.fontawesome.com/releases/v5.0.6/css/all.css" rel="stylesheet">
        <link href="{{ mix('css/app.css') }}" rel="stylesheet">
    </head>

    <body>
        <section id="app">

            @include("layouts.header") @if (session('status'))
            <aside class="section">
                <container class="container">
                    <div class="notification is-info">
                        {{ session('status') }}
                    </div>
                </container>
            </aside>
            @endif @yield('content')

        </section>

        <!-- Scripts -->
        <script src="{{ mix('js/manifest.js') }}"></script>
        <script src="{{ mix('js/vendor.js') }}"></script>
        <script src="{{ mix('js/app.js') }}" data-manual></script>
    </body>

</html>