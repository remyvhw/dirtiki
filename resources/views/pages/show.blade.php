@section('title', htmlspecialchars($page->name) . " — " . config("app.name")) @extends('layouts.app') @section('content')
<div class="section">
    <section class="container">
        {{ Breadcrumbs::render('page', $page) }}
        <div class="has-text-right">
            <a href="{{ route('pages.history', [$page]) }}" class="button">History</a>
            @if((new App\Policies\PagePolicy)->update(Auth::user(), $page))
            <a href="{{ route('pages.edit', [$page]) }}" class="button">Edit</a>
            @endif
        </div>
    </section>
</div>
<page-viewer page-json="{{ (new App\Http\Resources\PageResource($page))->toJson() }}">{{ $page->body->content }}</page-viewer>

@endsection