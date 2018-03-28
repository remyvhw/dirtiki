<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>@yield('title', config("app.name"))</title>

        @if(Setting::get("maps.provider") === "mapbox")
        <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.js'></script>
        <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css' rel='stylesheet' />
        <meta id="dirtiki-mapbox-key" name="mapbox-key" content="{{ Setting::get('maps.api_key') }}"> 
        @endif

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

            <search-modal v-if="query" v-model="query"></search-modal>
        </section>

        <!-- Scripts -->
        <script src="{{ mix('js/manifest.js') }}"></script>
        <script src="{{ mix('js/vendor.js') }}"></script>
        <script src="{{ mix('js/app.js') }}" data-manual></script> @if (Setting::get("maps.provider") === "google")
        <script src="https://maps.googleapis.com/maps/api/js?key={{ Setting::get('maps.api_key') }}&callback=initGoogleMap"
            async defer></script> @endif
    </body>

</html>