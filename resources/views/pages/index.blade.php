@extends('layouts.app') @section('content')
<main class="section">
    <section class="container">
        {{ Breadcrumbs::render('home') }}
        <aside class="menu">
            <ul class="menu-list">
                @foreach($pages as $page)
                <li>
                    <a href="{{ route('pages.show', $page) }}">
                        {{ $page->name }}
                    </a>
                </li>
                @endforeach
            </ul>
        </aside>
    </section>
</main>
@endsection