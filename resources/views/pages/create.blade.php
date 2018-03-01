@extends('layouts.app') @section('content')
<main class="section">
    <section class="container">
        {{ Breadcrumbs::render('page-creator') }}
        <page-creator></page-creator>
    </section>
</main>
@endsection