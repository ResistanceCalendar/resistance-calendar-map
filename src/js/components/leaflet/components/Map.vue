<template>
	<div id="map">
		<slot></slot>
	</div>
</template>

<script>
require('leaflet.markercluster');
import L from 'leaflet';
import { mapMutations, mapGetters } from 'vuex';

const props = {
  center: {
    custom: true,
    default: undefined,
  },
  maxBounds: {
    custom: true,
    default: undefined,
  },
  zoom: {
    type: Number,
    default: undefined,
  },
  minZoom: {
    type: Number,
    default: undefined,
  },
  maxZoom: {
    type: Number,
    default: undefined,
  },
  paddingBottomRight: {
    custom: true,
    default: null,
  },
  paddingTopLeft: {
    custom: true,
    default: null,
  },
  padding: {
    custom: true,
    default: null,
  },
  worldCopyJump: {
    type: Boolean,
    default: false,
  },
};

export default{
  props,
  methods: {
    ...mapMutations([
      'mapReady',
      'setMarkers'
    ]),
    ...mapGetters([
      'getMarkers',
      'getMap'
    ]),
  },
  mounted() {
    const options = {
      center: this.center,
      zoom: this.zoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
			maxBounds:this.maxBounds,
      preferCanvas: true
    };

    const mapObject = L.map('map', options);
    this.mapReady(mapObject);
    // window.markers = L.markerClusterGroup()
    // mapObject.addLayer(this.getMarkers)
  },
};


</script>

<style>
#map {
    height: 100%;
}
</style>
