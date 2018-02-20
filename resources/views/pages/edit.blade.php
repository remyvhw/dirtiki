@extends('layouts.app') @section('content')
<main class="section">
    <section class="container">
        {{ Breadcrumbs::render('pages', $page) }}
        <page-editor page-slug="{{ $page->slug }}"></page-editor>
    </section>
</main>
@endsection