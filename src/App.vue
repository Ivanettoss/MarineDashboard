<template>
  <div class="container">
    <h1 class="dashboard-title">Marine Science Dashboard</h1>
    <p class="subtitle">Real-time oceanographic data visualization</p>

    <!-- Filters -->
    <div class="filters">
      <input v-model="search" type="text" placeholder="Search by buoy ID..." />
      <input v-model="fromDate" type="date" />
      <input v-model="toDate" type="date" />
      <select v-model="selectedVariable">
        <option value="ALL">All</option>
        <option value="temp">Temperature</option>
        <option value="salinity">Salinity</option>
        <option value="depth">Depth</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <div class="table-section">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Buoy ID</th>
              <th>Temperature (°C)</th>
              <th>Salinity (PSU)</th>
              <th>Depth (m)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in paginatedData" :key="record.id">
              <td>{{ record.timestamp }}</td>
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
          Pagina {{ currentPage }} di {{ totalPages }}
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
import { filterByDateRange, filterByVariable } from './scripts/filters.js';
import { updateChart } from './scripts/chart.js';

// === Ref elementi DOM ===
const chartCanvas = ref(null);

// === Dati reattivi ===
const rawData = ref([]);
const processedData = ref([]);
const search = ref("");
const fromDate = ref("");
const toDate = ref("");
const selectedVariable = ref("ALL");
const currentPage = ref(1);
const itemsPerPage = ref(50);

// === Filtro 1: per search ===
const filteredBySearch = computed(() => {
  if (!search.value.trim()) return processedData.value;
  return processedData.value.filter(record =>
    record.buoy.includes(search.value.trim())
  );
});

// === Filtro 2: per intervallo di date ===
const filteredByDate = computed(() => {
  if (!fromDate.value || !toDate.value) return filteredBySearch.value;
  return filterByDateRange(filteredBySearch.value, fromDate.value, toDate.value);
});

// === Filtro 3: per variabile ===
const finalFilteredData = computed(() => {
  return filterByVariable(filteredByDate.value, selectedVariable.value);
});

// === Watch: aggiorna il chart quando i dati cambiano ===
watch(finalFilteredData, async (newData) => {
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

// === Caricamento iniziale ===
onMounted(async () => {
  try {
    const raw = await fetchData();
    rawData.value = raw;
    processedData.value = preprocessRecords(raw);
    await nextTick();
    if (chartCanvas.value) {
      updateChart(chartCanvas.value, processedData.value);
    } else {
      console.warn("Canvas non trovato durante il montaggio.");
    }
  } catch (err) {
    console.error("Errore nel caricamento dati:", err);
  }
});

// === Paginazione ===
const totalPages = computed(() => {
  return Math.ceil(finalFilteredData.value.length / itemsPerPage.value);
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return finalFilteredData.value.slice(start, end);
});

watch(finalFilteredData, () => {
  currentPage.value = 1;
});
</script>
