<?php
Breadcrumbs::register('home', function ($breadcrumbs) {
    $breadcrumbs->push('Home', route('home'));
});

Breadcrumbs::register('login', function ($breadcrumbs) {
    $breadcrumbs->parent('home');
    $breadcrumbs->push('Login', route('login'));
});

Breadcrumbs::register('register', function ($breadcrumbs) {
    $breadcrumbs->parent('home');
    $breadcrumbs->push('Register', route('register'));
});

Breadcrumbs::register('page', function ($breadcrumbs, $page) {
    $breadcrumbs->parent('home');
    $breadcrumbs->push($page->name, route('pages.show', [$page]));
});

Breadcrumbs::register('page-editor', function ($breadcrumbs, $page) {
    $breadcrumbs->parent('page', $page);
    $breadcrumbs->push("Edit", route('pages.edit', $page));
});

Breadcrumbs::register('page-creator', function ($breadcrumbs) {
    $breadcrumbs->parent('home');
    $breadcrumbs->push("New Page", route('pages.create'));
});

Breadcrumbs::register('page-history', function ($breadcrumbs, $page) {
    $breadcrumbs->parent('page', $page);
    $breadcrumbs->push("History", route('pages.history', $page));
});
