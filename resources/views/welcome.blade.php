@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
    <div class="col-md-9">
        <map-view></map-view>
    </div>
    <div class="col-md-3" style="padding: 0px">
        <filter-view></filter-view>
    </div>
</div>
</div>
@endsection
