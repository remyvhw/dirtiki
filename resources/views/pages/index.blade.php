@extends('layouts.app') @section('content')
<main class="section">
    <section class="container">
        {{ Breadcrumbs::render('home') }} @if((new App\Policies\PagePolicy)->store(Auth::user()))
        <a href="{{ route('pages.create') }}" class="button is-pulled-right">New page</a>
        @endif
        <aside class="menu">
            <ul class="menu-list">
                @foreach($pages as $page)
                <li>
                    <a href="{{ route('pages.show', $page) }}" style="padding-left: 0;">
                        {{ $page->name }}
                    </a>
                </li>
                @endforeach
            </ul>
        </aside>
    </section>
</main>
@endsection