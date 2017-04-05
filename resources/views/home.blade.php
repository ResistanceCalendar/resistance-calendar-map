@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div class="panel panel-default">
                <div class="panel-heading">Dashboard</div>

                <div class="panel-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="panel panel-primary">
                                <div class="panel-heading">
                                    <h3>{{App\CalendarEvent::get()->count() }} events</h3>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="panel panel-info">
                                <div class="panel-heading">
                                    <h3>{{ App\CalendarEvent::get()->count() == 0 ? 0 : floor(App\CalendarEvent::where('event->location', '!=', null)->get()->count() / App\CalendarEvent::get()->count() * 100) }}% with locations</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <a class="btn btn-primary" href="/import">Truncate &amp; import</a>
                    <a class="btn btn-primary" href="/clearcache">Clear cache</a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
