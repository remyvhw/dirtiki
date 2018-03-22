@extends('layouts.app') @section('content')
<div class="section">
    <section class="container">
        {{ Breadcrumbs::render('settings-editor', $group) }}
        <div class="columns">
            <div class="column is-one-quarter">
                <aside class="menu">
                    <ul class="menu-list">
                        @foreach($settings as $setting)

                        <li>
                            <a
                             href="{{ route('settings.edit', ['group'=>$setting->key]) }}"
                             @if($group->key === $setting->key)
                              class="is-active"
                             @endif
                             >{{ $setting->label() }}</a>
                        </li>

                        @endforeach
                    </ul>
                </aside>
            </div>
            <div class="column">
            {!! Form::open(['route' => ['settings.edit', $group->key]]) !!}
                @foreach($group->children() as $setting)
                <div class="field">
                    {!! Bulma::label($setting->label())->text($setting->key); !!}
                </div>
                @endforeach
                <div class="field">
                    <div class="control">
                        <button type="submit" class="button is-primary">Save</button>
                    </div>
                </div>
            {!! Form::close() !!}
            </div>
        </div>
    </section>
</div>

@endsection