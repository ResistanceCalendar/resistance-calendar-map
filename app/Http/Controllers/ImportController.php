<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\CalendarEvent;
use \DateTime;

class ImportController extends Controller
{
	public function __construct()
	{
		$this->middleware('auth');
	}

	public function importOSDI(Request $request)
	{
		$this->validate($request, [
			'url'      => 'required|url',
			'truncate' => 'required|boolean'
		]);

		if(request()->input('truncate') === true) {
			\DB::table('calendar_events')->truncate();
		}

		$response = json_decode(file_get_contents(request()->input('url')));
		$events = $response->{'_embedded'}->{'osdi:events'};

		foreach($events as $event) {
			$model = new CalendarEvent;
			$model->event = $event;
			$model->save();
		}

		\Artisan::call('cache:clear');

		return "Events imported";
	}

	public function importEventsETL(Request $request)
	{
		$this->validate($request, [
			'url'      => 'required|url',
			'truncate' => 'required|boolean'
		]);
		
		if(request()->input('truncate') === true) {
			\DB::table('calendar_events')->truncate();
		}

		$response = (file_get_contents(request()->input('url')));
		$events = json_decode(str_replace('window.INDIVISIBLE_EVENTS=', '', $response));

		foreach($events as $event) {
			if($event->{'start_datetime'} == "" || new DateTime($event->{'start_datetime'}) > new DateTime()) {
				$model = new CalendarEvent;
				$extraData = [
				'formatType' => 'events-etl',
				'event_type' => $event->{'event_type'} == 'Indivisible Action' ? 'Event' : $event->{'event_type'}
				];
				$model->event = (object) array_merge((array) $event, (array) $extraData);
				$model->save();
			}
		}

		\Artisan::call('cache:clear');

		return "imported";
	}
}
