<template>
    <div>
        <l-map :zoom="zoom" :center="center" :min-zoom="minZoom" :max-zoom="maxZoom" style="width: 100%; height: 93vh; padding: 0px; margin-top: -22px; margin-left: -15px">
            <l-tilelayer :url="url" attribution="Resistance Calendar"></l-tilelayer>
            <l-marker v-for="marker in markers" :position="[marker.event.location.location.coordinates[1],marker.event.location.location.coordinates[0] ]" :title="marker.event.name" :draggable="false" v-if="marker.event.name.includes(query) && marker.event.total_accepted >= min && marker.event.location">
                <l-popup :content="markerInfo(marker)"></l-popup>
            </l-marker>
        </l-map>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    export default {
        mounted() {
            this.markers = Laravel.events
        },
        computed: {
            currentCity() {
                return this.$store.state.currentCity;
            },
            query() {
                return this.$store.state.query;
            },
            min() {
                return this.$store.state.minAttendance;
            },
            ...mapGetters([
                'getMap',
            ]),
        },
        watch: {
            'currentCity': function(e) {
                if(e.lat != 0 && e.lng != 0) {
                    this.getMap.flyTo(e, 12);
                }
            }
        },
        data () {
            return {
                center: [37.0, -95.0],
                markers: [],
                zoom: 4,
                minZoom: 0,
                maxZoom: 15,
                url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            }
        },
        methods: {
            markerInfo(marker) {
                return '<b>' + marker.event.name + '</b><hr style="margin: 3px;">'
                + ("" + marker.event.description).substring(0,500)
                + '<div class="row">'
                + '<div class="col-md-6">'
                + '<a href="https://facebook.com/events/' + marker.event.identifiers[0].substring(9) + '" class="btn btn-primary btn-block">DETAILS</a>'
                + '</div>'
                + '<div class="col-md-6">'
                + '<a class="btn btn-default btn-block disabled">' + marker.event.total_accepted + ' ATTENDING</a>'
                + '</div>'
                '</div>'
            },
            matchesQuery(m) {
                console.log(m.event.name);
                return m.event.name.includes(this.query);
            }
        }
    }
</script>
