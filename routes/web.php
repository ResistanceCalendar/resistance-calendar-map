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
	    foreach(App\CalendarEvent::get() as $event) {
	    	if(!isset($event['event']['formatType'])) {
	    		if(isset($event['event']['location']['location']['coordinates'])) {
	    			array_push($events, [
	    				'start_datetime' => $event['event']['start_date'],
	    				'url'            => 'https://facebook.com/events/' . substr($event['event']['identifiers'][0], 9),
	    				'venue'          => '',
	    				'group'          => null,
	    				'title'          => $event['event']['title'],
	    				'lat'            => isset($event['event']['location']['location']['coordinates'][1]) ? $event['event']['location']['location']['coordinates'][1] : '',
	    				'lng'            => isset($event['event']['location']['location']['coordinates'][0]) ? $event['event']['location']['location']['coordinates'][0] : '',
	    				'supergroup'     => 'Indivisible',
	    				'event_type'     => 'Event',
	    				'attending'      => isset($event['event']['total_accepted']) ? $event['event']['total_accepted'] : null,
	    			]);
	    		}
	    	}
	    	else if($event['event']['formatType'] == 'events-etl') {
	    		array_push($events,
	    			(object) array_merge((array) $event['event'], (array) ['attending' => 0])
	    		);
	    	}
	    }
	    return $events;
	}));
});

Auth::routes();

Route::get('/home', 'HomeController@index');
