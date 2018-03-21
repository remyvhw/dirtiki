@extends('layouts.app')
@section('content')
<div class="section">
    <section class="container">
        {{ Breadcrumbs::render('settings-editor', $group) }} 
        
    </section>
</div>

@endsection