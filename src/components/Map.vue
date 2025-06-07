<template>
    <div id="map" style="height: 500px;"></div>
</template>
  

  <script setup>
  import { onMounted, watch, ref } from 'vue';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';
  
  const props = defineProps({
    markers: {
      type: Array,
      required: true
    }
  });
  
  let map = null;
  let leafletMarkers = [];
  
  onMounted(() => {
    map = L.map('map').setView([42.030761, 11.909473], 13);
    
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    updateMarkers(props.markers);
  });
  


  watch(() => props.markers, (newMarkers) => {
    updateMarkers(newMarkers);
  }, { deep: true });
  

  
  function updateMarkers(markers) {
    // Rimuovi i marker precedenti
    leafletMarkers.forEach(m => map.removeLayer(m));
    leafletMarkers = [];
  
    // Aggiungi i nuovi marker
    markers.forEach(m => {
      const marker = L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.label || '');
      leafletMarkers.push(marker);
    });
  }
  </script>
  