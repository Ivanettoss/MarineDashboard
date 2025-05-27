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
        <tr v-for="record in finalFilteredData" :key="record.id">
          <td>{{ record.timestamp }}</td>
          <td>{{ record.buoy }}</td>
          <td>{{ record.temp }}</td>
          <td>{{ record.salinity }}</td>
          <td>{{ record.depth }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Chart -->
    <div class="chart-container">
      <canvas id="chart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { fetchData } from './scripts/api_management.js';
import { preprocessRecords } from './scripts/preprocessing.js';
import { filterByDateRange, filterByVariable } from './scripts/filters.js';
import { updateChart } from './scripts/chart.js';

// === Dati reattivi ===
const rawData = ref([]);
const processedData = ref([]);
const search = ref("");
const fromDate = ref("");
const toDate = ref("");
const selectedVariable = ref("ALL");

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

// === Sincronizza il chart ogni volta che i dati finali cambiano ===
watch(finalFilteredData, async (newData) => {
  await nextTick();
  updateChart("chart", newData);
});

// === Caricamento iniziale ===
onMounted(async () => {
  try {
    const raw = await fetchData();
    rawData.value = raw;
    processedData.value = preprocessRecords(raw);
    await nextTick();
    updateChart("chart", processedData.value);
  } catch (err) {
    console.error("Errore nel caricamento dati:", err);
  }
});
</script>
