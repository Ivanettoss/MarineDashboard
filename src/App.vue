<template>
  <div class="container">
    <h1 class="dashboard-title">Marine Science Dashboard</h1>
    <p class="subtitle">Real-time oceanographic data visualization</p>

    <div class="filters">
      <button
        @click="showFilters = !showFilters"
        class="toggle-button"
        aria-label="Mostra o nascondi i filtri">
        <svg viewBox="0 0 24 24" class="icon">
          <path d="M3 4h18v2H3V4zm3.5 6h11l-4 5v5l-3 2v-7l-4-5z" />
        </svg>
      </button>

      <div v-if="showFilters" class="advanced-filters">

        <div class="datepicker">
          <div class="dateline">
            <label for="fromDate">From</label>
            <input v-model="fromDate" type="date" id="fromDate" />
          </div>

          <div class="dateline">
            <label for="toDate">To</label>
            <input v-model="toDate" type="date" id="toDate" />
          </div>
        </div>

 <n-config-provider :theme-overrides="theme">
    <div class="timepicker">
      <div class="timeline">
        <label for="fromTime">From Time</label>
        <n-time-picker id="fromTime" v-model:value="fromTime" format="HH:mm" />
      </div>
      <div class="timeline">
        <label for="toTime">To Time</label>
        <n-time-picker id="toTime" v-model:value="toTime" format="HH:mm" />
      </div>
    </div>
  </n-config-provider>
        
        <div class="location-filter">
  <div class="location-line">
    <label for="locationInput">Location</label>
    <input v-model="locationInput" type="text" id="locationInput" placeholder="Es. Ibiza..." />
  </div>

  <div class="location-line">
    <label for="rangeSelect">Range (km)</label>
    <select v-model="distanceRange" id="rangeSelect">
      <option :value="10">10 km</option>
      <option :value="100">100 km</option>
      <option :value="1000">1000 km</option>
    </select>
  </div>
  
</div>
  <button @click="resetFilters" id="reset">
    Reset 
  </button>
      </div>
    </div>

    

    <div class="table-bar">
     <button id="switch-view" @click="currentView = currentView === 'table' ? 'map' : 'table'">
  {{ currentView === 'table' ? 'Show in Map' : 'Show in Table' }}
</button>
    <input v-model="search" class="search-id" type="text" placeholder="Search by buoy ID..." />
  </div>

    <Map v-if="currentView === 'map'" :markers="updateMarkers" />
     

    <div v-else class="table-wrapper">
      <div class="table-section">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Buoy ID</th>
              <th>Temperature (°C)</th>
              <th>Salinity (PSU)</th>
              <th>Depth (m)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in paginatedData" :key="record.id">
              <td>{{ record.timestamp }}</td>
              <td>{{ record.lat }}</td>
              <td>{{ record.lon }}</td>
              <td>{{ record.buoy }}</td>
              <td>{{ record.temp }}</td>
              <td>{{ record.salinity }}</td>
              <td>{{ record.depth }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-controls">
        <button @click="currentPage--" :disabled="currentPage === 1">«</button>
        <span class="page-indicator">
          {{ currentPage }} - {{ totalPages }}
        </span>
        <button @click="currentPage++" :disabled="currentPage === totalPages">»</button>
      </div>
    </div>

    <div class="chart-wrapper">
      <h2 class="chart-title"> Live Chart Visualization</h2>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { fetchData } from './scripts/api_management.js';
import { preprocessRecords } from './scripts/preprocessing.js';
import { filterByDateRange, filterByLocation, filterByTimeRange } from './scripts/filters.js';
import { updateChart } from './scripts/chart.js';
import Map from './components/Map.vue';
import { NTimePicker, NConfigProvider } from 'naive-ui';
import theme from './theme/time-picker-theme.json' // importa il tuo tema personalizzato


// === Ref elementi DOM ===
const chartCanvas = ref(null);

// === Dati reattivi ===
const rawData = ref([]);
const processedData = ref([]);
const search = ref("");
const fromDate = ref("");
const toDate = ref("");
// const selectedVariable = ref("ALL"); // Rimosso
const currentPage = ref(1);
const itemsPerPage = ref(50);
const showFilters = ref(false);
const locationInput = ref("");
const distanceRange = ref(100);
const locationFilteredData = ref([]);


const fromTime = ref(null);
const toTime = ref(null);
const currentView = ref("table");

function resetFilters() {
  fromDate.value = "";
  toDate.value = "";
  fromTime.value = null;
  toTime.value = null;
  locationInput.value = "";
  distanceRange.value = 100;
  search.value = "";
  currentPage.value = 1;
}


// === Filtro: per search ===
const filteredBySearch = computed(() => {
  if (!search.value.trim()) return processedData.value;
  return processedData.value.filter(record =>
    record.buoy.includes(search.value.trim())
  );
});


const filteredByDate = computed(() => {
  if (!fromDate.value || !toDate.value) return filteredBySearch.value;
  return filterByDateRange(filteredBySearch.value, fromDate.value, toDate.value);
});

const filteredByTime=computed(()=> {
  if (!fromTime.value || !toTime.value) return filteredByDate.value;
  return filterByTimeRange(filteredByDate.value, fromTime.value, toTime.value);
  });

 



watch([locationInput, distanceRange, filteredByTime],
  async ([loc, range, dateFilteredData]) => {
    if (!loc.trim()) {
      locationFilteredData.value = dateFilteredData;
      return;
    }
    try {
      locationFilteredData.value = await filterByLocation(dateFilteredData, loc.trim(), range);
    } catch (e) {
      console.error("Errore nel filtro per location:", e);
      locationFilteredData.value = [];
    }
  },
  { immediate: true }
);


// === Watch: aggiorna il chart ===
watch(locationFilteredData, async (newData) => {
  try {
    await nextTick();
    if (chartCanvas.value) {
      updateChart(chartCanvas.value, newData);
    } else {
      console.warn("Elemento canvas non trovato (ref nullo).");
    }
  } catch (e) {
    console.error("Errore nell'aggiornamento del chart:", e);
  }
});


onMounted(async () => {
  try {
    const raw = await fetchData();
    rawData.value = raw;
    processedData.value = preprocessRecords(raw);
    await nextTick();
    if (chartCanvas.value) {
      updateChart(chartCanvas.value, processedData.value);
    } else {
      console.warn("Canvas not found");
    }
  } catch (err) {
    console.error("Error during data loading", err);
  }
});


const totalPages = computed(() => {
  return Math.ceil(locationFilteredData.value.length / itemsPerPage.value);
});

const paginatedData = computed(() => {
  const data = locationFilteredData.value || [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return data.slice(start, end);
});

watch(locationFilteredData, () => {
  currentPage.value = 1;
});

const updateMarkers = computed(() => {
  return locationFilteredData.value.map(record => ({
    lat: record.lat,
    lng: record.lon,
     rowData: [
      record.buoy,
      record.timestamp,
      record.temp,
      record.salinity,
      record.depth
    ]
  }));
});
</script>
