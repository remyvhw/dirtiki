<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
 */
Route::name('api.')->group(function () {

    Route::group(['middleware' => ['auth:api']], function () {
        Route::get('users/self', 'Api\UserController@getSelf')->name("users.self");
    });

    /**
     * History routes
     */
    Route::get('pages/{page}/history', 'Api\PageController@getHistory')->name("pages.history");
    Route::get('pages/{page}/body/history', 'Api\PageBodyController@getHistory')->name("pages.body.history");

    /**
     * Search routes
     */
    Route::get('pages/search', 'Api\PageController@getSearch')->name("pages.search");

    /**
     * API resources routes
     */
    Route::get('pages/{page}/body', 'Api\PageBodyController@index')->name("pages.body.show");
    Route::put('pages/{page}/body', 'Api\PageBodyController@update')->name("pages.body.update");

    Route::apiResources([
        'pages' => 'Api\PageController',
        'users' => 'Api\UserController',
        'images' => 'Api\ImageController',
    ]);

});
