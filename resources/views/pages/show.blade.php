@extends('layouts.app') @section('content')
<div class="section">
    <section class="container">
        {{ Breadcrumbs::render('page', $page) }} @if((new App\Policies\PagePolicy)->update(Auth::user(), $page))
        <a href="{{ route('pages.edit', [$page]) }}" class="button is-pulled-right">Edit</a>
        @endif
    </section>
</div>
<page-viewer page-json="{{ (new App\Http\Resources\PageResource($page))->toJson() }}">{{ $page->body->content }}</page-viewer>

@endsection