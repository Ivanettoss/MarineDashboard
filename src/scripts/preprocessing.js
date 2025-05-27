export function preprocessRecords(records) {
    
    return records.map(record => {
      const newRecord = { ...record };
  
      // Converte il timestamp ISO in millisecondi
      if (record.timestamp) {
        newRecord._timestamp = new Date(record.timestamp).getTime();
      } else {
        newRecord._timestamp = null; // o -1, o Date.now() come fallback
      }
  

      return newRecord;
    });
  }
  