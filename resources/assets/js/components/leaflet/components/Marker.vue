<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import L from 'leaflet';

const props = {
  position: {
    type: Array,
  },
  draggable: {
    type: Boolean,
    custom: true,
    default: false,
  },
  opacity: {
    type: Number,
    default: 1,
  },
  title: {
    type: String,
  },
};

export default {
  props,
  computed: {
    ...mapGetters([
      'getMap',
      'getMarkers'
    ]),
  },
  data() {
    return {
      marker: null
    }
  },
  mounted() {
    //this.fixImageUrl();

    const options = {
      draggable: this.draggable,
      title: this.title,
    };

    //const marker = this.$marker = L.marker(this.position, options);

    const marker = this.$marker = L.circleMarker(this.position, {
      radius: 5,
      color: 'white',
      fillColor: '#ec3659',
      weight: 2,
      fillOpacity: 1
    }).addTo(this.getMap);

    this.marker = marker;

    var markers = L.markerClusterGroup();

    this.$nextTick(function () {
      this.getMap.addLayer(marker);
    });
  },
  destroyed() {
    this.$nextTick(function () {
      this.getMap.removeLayer(this.marker);
    });
  },
  methods: {
       fixImageUrl() {
           //https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061
           delete L.Icon.Default.prototype._getIconUrl
           L.Icon.Default.mergeOptions({
               // iconRetinaUrl: this.iconRetina,
               // iconUrl: this.icon,
               // shadowUrl: this.iconShadow,
           });
       }
   }

};

</script>
