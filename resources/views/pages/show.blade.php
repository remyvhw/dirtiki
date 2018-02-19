@extends('layouts.app') @section('content')
<main class="section">



    <section class="container">
        {{ Breadcrumbs::render('pages', $page) }}

    </section>
</main>
@endsection