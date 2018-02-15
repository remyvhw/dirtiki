<?php

use Illuminate\Http\Request;

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

Route::group(['middleware' => ['auth:api']], function () {

    Route::get('/users/self', function (Request $request) {
        return $request->user();
    });

});
/**
 * History routes
 */
Route::get('pages/{page}/history', 'Api\PageController@getHistory');
Route::get('pages/{page}/body/history', 'Api\PageBodyController@getHistory');

/**
 * API resources routes
 */
Route::get('pages/{page}/body', 'Api\PageBodyController@index');
Route::put('pages/{page}/body', 'Api\PageBodyController@update');

Route::apiResources([
    'pages' => 'Api\PageController',
]);
