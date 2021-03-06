<nav class="navbar is-light" role="navigation" aria-label="main navigation">
    <div class="container">
        <div class="navbar-brand">
            <div class="navbar-item">
                <strong>
                    <a href="{{ route('home') }}">{{ config("app.name") }}</a>
                </strong>
            </div>
        </div>

        <div class="navbar-end">

            @can("update-settings")
            <a class="navbar-item" href="{{ route('settings.index') }}">
                Settings
            </a>
            @endcan

            @if(config("scout.driver"))
            <div class="navbar-item">
                <div class="control has-icons-right">
                    <input class="input" v-model="query" placeholder="Search">

                    <span class="icon is-small is-right">
                        <i class="fas fa-search"></i>
                    </span>
                </div>
            </div>
            @endif 
            @guest
            @if (Setting::get("users.allow_signups", false))
            <a class="navbar-item" href="{{ route('register') }}">
                Register
            </a>
            @endif
            <a class="navbar-item" href="{{ route('login') }}">
                Login
            </a>

            @else
            <a class="navbar-item" href="#">
                {{ Auth::user()->name }}
            </a>


            @endguest

        </div>
    </div>
</nav>