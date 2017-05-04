const state = {
  map: null,
  markers: null
};

const mutations = {
  mapReady(stat, map) {
    stat.map = map;
  },
  setMarkers(state, markers) {
  	state.markers = markers;
  }
};

const getters = {
  getMap: stat => stat.map,
  getMarkers: state => state.markers
};

export default({
  state,
  mutations,
  getters,
});
