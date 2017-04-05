
/**
* First we will load all of this project's JavaScript dependencies which
* includes Vue and other libraries. It is a great starting point when
* building robust, powerful web applications using Vue and Laravel.
*/

require('./bootstrap');

/**
* Next, we will create a fresh Vue application instance and attach it to
* the page. Then, you may begin adding components to this application
* or customize the JavaScript scaffolding to fit your unique needs.
*/

Vue.component('map-view', require('./components/Map.vue'));
Vue.component('filter-view', require('./components/Filter.vue'));

import * as VueGoogleMaps from 'vue2-google-maps';

Vue.use(VueGoogleMaps, {
    load: {
        key: window.Laravel.googleMapsKey,
        libraries: 'places'
    }
});

import Vuex from 'vuex'

Vue.use(Vuex)

import VueLeaflet from './components/leaflet/index'

const store = new Vuex.Store({
    state: {
        currentCity: "",
        query: "",
        minAttendance: 0,
    },
    mutations: {
        setCity (state, city) {
            state.currentCity = city
        },
        setQuery (state, query) {
            state.query = query
        },
        setMinAttendance (state, min) {
            state.minAttendance = min
        }
    },
    modules:{
        VL: VueLeaflet.store,
    }
})

Vue.use(VueLeaflet.plugin,store);

const app = new Vue({
    el: '#app',
    store
});
