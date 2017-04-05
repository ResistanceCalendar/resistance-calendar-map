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

Route::get('import', function() {
	DB::table('calendar_events')->truncate();
	$response = json_decode(file_get_contents("https://resistance-calendar.herokuapp.com/v1/events?per_page=5000"));
	$events = $response->{'_embedded'}->{'osdi:events'};

	foreach($events as $event) {
		$model = new App\CalendarEvent;
		$model->event = $event;
		$model->save();
	}

	return "Events imported";
});

Route::get('clearcache', function() {
	Artisan::call('cache:clear');
	return "Cache cleared";
});

Auth::routes();

Route::get('/home', 'HomeController@index');
