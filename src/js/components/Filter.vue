<template>
    <div>
        <div style="margin: -22px 0 0 -30px; border-radius: 0px; padding: 15px; background-color: #e6e6e6; height: 100%">
            <h2 style="margin-top: 0">Upcoming events</h2>
            <gmap-autocomplete
                      class="form-control"
                      @place_changed="setPlace">
                    </gmap-autocomplete>
            <input type="text" class="form-control" v-model="search" placeholder="Search">
            <input type="range" min="0" max="5000" v-model.number="minAttendance"/>
            <input type="submit" class="btn btn-primary btn-block" value="Search" @click="submitSearch">
        </div>
        <div style="position: absolute; overflow-y: scroll; height: 100vh; width: 100%;">
            <li style="word-wrap: break-word;" v-for="event in events" v-if="event.event.name.includes(query) && event.event.total_accepted >= min">{{event.event.name}}</li>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                latLng: {},
                search: '',
                minAttendance: 0
            }
        },
        computed: {
            events() {
                return Laravel.events
            },
            query() {
                return this.$store.state.query
            },
            min() {
                return this.$store.state.minAttendance
            }
        },
        methods: {
            setDescription(description) {
                this.description = description;
            },
            setPlace(place) {
                if(typeof(place.geometry) != "undefined") {
                    console.log(place.geometry.location.lat())
                    this.latLng = [
                        place.geometry.location.lat(),
                        place.geometry.location.lng(),
                    ];
                } else {
                    this.latLng = {}
                }

                this.$store.commit('setCity', this.latLng)
            },
            submitSearch() {
                this.$store.commit('setQuery', this.search);
                this.$store.commit('setMinAttendance', this.minAttendance);
            }
        }
    }
</script>
