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
  Cache::flush();
	return response()->json(Cache::remember('events', 60, function () {
    $events = [];
    $now = urlencode(date('\'Y-m-d\''));
    error_log($now);
    $query = "\$filter=start_date%20gt%20$now";
    $url = "https://resistance-calendar.herokuapp.com/v1/events?page=0&per_page=3000&$query";
    error_log($url);
    $response = file_get_contents($url);
    if ($response !== false) {
      error_log("response okay");
      $responseJson = json_decode($response, true);
      error_log("response decoded");
	    foreach($responseJson['_embedded']['osdi:events'] as $event) {
    		if(isset($event['location']['location'])) {
          $eventUrl = 'https://www.resistancecalendar.org/event/' . $event['_id'];
    			array_push($events, [
    				'start_datetime' => $event['start_date'],
    				'url'            => $eventUrl,
    				'venue'          => '',
    				'group'          => null,
    				'title'          => $event['title'],
    				'lat'            => isset($event['location']['location']['latitude']) ? $event['location']['location']['latitude'] : '',
    				'lng'            => isset($event['location']['location']['longitude']) ? $event['location']['location']['longitude'] : '',
    				'supergroup'     => 'Indivisible',
    				'event_type'     => 'Event',
    				'attending'      => isset($event['total_accepted']) ? $event['total_accepted'] : null,
    			]);
    		}
	    }
    }
    error_log($url);
    return $events;
	}));
});

Auth::routes();

Route::get('/home', 'HomeController@index');
