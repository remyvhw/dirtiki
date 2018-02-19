@extends('layouts.app') @section('content')
<main class="section">



    <section class="container">
        {{ Breadcrumbs::render('pages', $page) }}
        <page-viewer page="{{ (new App\Http\Resources\PageResource($page))->toJson() }}">
            {{ $page->body->content }}
        </page-viewer>
    </section>
</main>
@endsection