@extends('layouts.app') @section('content')
<div class="section">
    <section class="container">
        {{ Breadcrumbs::render('settings-editor', $group) }}
        <div class="columns">
            <div class="column is-one-quarter">
                <aside class="menu">
                    <p class="menu-label">
                        Settings
                    </p>
                    <ul class="menu-list">
                        @foreach($settings->sortBy(function ($item) {
                            return $item->label();
                        }) as $setting)

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
            @if ($errors->any())
<article class="message is-danger">
  <div class="message-header">
    <p>Oops</p>
  </div>
  <div class="message-body">
  <ul>
     @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
    @endforeach
        </ul>
  </div>
</article>

@endif
            {!! Form::open(['route' => ['settings.edit', $group->key]]) !!}
                @foreach($group->children() as $setting)
                <div class="field">
  {!! Form::label($setting->paramName(), $setting->label(), ['class' => 'label']) !!}

  <div class="control
@if($errors->has($setting->paramName()))
  is-danger
@endif
  ">

  {!! $setting->fieldHtml() !!}
  @if ($setting->help())
  <p class="help">{{ $setting->help() }}</p>
  @endif
  </div>
  
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