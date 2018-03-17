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

Route::get('/', function () {
    return view('welcome');
});

Route::post('import/OSDI', 'ImportController@importOSDI');

Route::post('import/events-etl', 'ImportController@importEventsEtl');

Route::get('events', function() {
	return response()->json(Cache::remember('events', 60, function () {
    $events = [];
    $now = urlencode(date('\'Y-m-d\''));
    $query = "\$filter=start_date%20gt%20$now";
    $url = "https://resistance-calendar.herokuapp.com/v1/events?page=0&per_page=3000&$query";
    $response = file_get_contents($url);
    if ($response !== false) {
      return json_decode($response, true);
    } else {
      return [];
    }
	}));
});

Auth::routes();

Route::get('/home', 'HomeController@index');
