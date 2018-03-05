@if(config("dirtiki.rendering.maps.provider"))

@if(config("dirtiki.rendering.maps.provider") === "mapbox")
    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css' rel='stylesheet' />
    <meta id="dirtiki-maps-key" name="mapbox-maps-key" content="{{ config("dirtiki.rendering.maps.key") }}">
@elseif (config("dirtiki.rendering.maps.provider") === "google")
    <script src="https://maps.googleapis.com/maps/api/js?{{ config('dirtiki.rendering.maps.key') ? 'key=' . config('dirtiki.rendering.maps.key') : '' }}&callback=initGoogleMap"
    async defer></script>
@endif

@endif