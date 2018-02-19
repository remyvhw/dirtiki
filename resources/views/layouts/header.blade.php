<section class="section">
    <div class="container">
        <nav class="level">
            <!-- Left side -->
            <div class="level-left">
                <div class="level-item">
                    <p class="title is-5">
                        <strong>
                            <a href="{{ route('home') }}">{{ config("app.name") }}</a>
                        </strong>
                    </p>
                </div>
            </div>

            <!-- Right side -->
            <div class="level-right">
                @guest
                <p class="level-item">
                    <a href="{{ route('register') }}">Register</a>
                </p>
                <p class="level-item">
                    <a href="{{ route('login') }}">Login</a>
                </p>
                @else
                <p class="level-item">
                    {{ Auth::user()->name }}
                </p>

                @endguest
            </div>
        </nav>
    </div>
</section>