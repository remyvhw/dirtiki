<nav class="navbar is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <div class="navbar-item">
            <strong>
                <a href="{{ route('home') }}">{{ config("app.name") }}</a>
            </strong>
        </div>
    </div>

    <div class="navbar-end">

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
        <a class="navbar-item" href="{{ route('register') }}">
            Register
        </a>
        <a class="navbar-item" href="{{ route('login') }}">
            Login
        </a>

        @else
        <a class="navbar-item" href="#">
            {{ Auth::user()->name }}
        </a>


        @endguest

    </div>
</nav>