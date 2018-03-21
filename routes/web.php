<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
 */

Route::get('/', 'HomeController@index')->name('home')->middleware(['installcheck']);

Route::get('images/{image}', 'ImageController@getShow')->name("images.show");

Route::get('pages/{page}/history', 'PageController@getHistory')->name("pages.history");

Route::resource('pages', 'PageController', ['only' => [
    'create', 'show', 'edit',
]]);

Route::get('settings/{group}', 'SettingController@getEdit')->name("settings.edit");
Route::post('settings/{group}', 'SettingController@postUpdate')->name("settings.update");

Route::get('strings', function () {
    return __("frontend");
});

Auth::routes();
