
export function filterByDateRange(records, from, to) {
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    return records.filter(r =>
      r._timestamp >= start && r._timestamp <= end
    );
  }
  

  export function filterByVariable(records, variableName) {
    if (!variableName || variableName === 'ALL') {
      // Nessun filtro: ritorna i record così come sono
      return records;
    }
  
    return records.map(record => {
      const filtered = {
        timestamp: record.timestamp,
        lat: record.lat,
        lon: record.lon,
      };
  
      if (record[variableName] !== undefined) {
        filtered[variableName] = record[variableName];
      }
  
      return filtered;
    });
  }
  