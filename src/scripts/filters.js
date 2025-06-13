
export function filterByDateRange(records, from, to) {
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    return records.filter(r =>
      r._timestamp >= start && r._timestamp <= end
    );
  }


export function filterByTimeRange(records, from, to) {
  const timeToMinutes = ms => {
    const d = new Date(ms);
    return d.getHours() * 60 + d.getMinutes();
  };

  const start = timeToMinutes(from);
  const end = timeToMinutes(to);

  console.log(`Filtro orario attivo: da ${start} a ${end} minuti`);

  return records.filter(r => {
    const timeInMinutes = timeToMinutes(r._timestamp);
    console.log(`→ Record ${r._timestamp}: ${timeInMinutes} minuti`);

    if (start <= end) {
      const inRange = timeInMinutes >= start && timeInMinutes <= end;
      console.log(`✓ inRange: ${inRange}`);
      return inRange;
    } else {
      
      const inNightRange = timeInMinutes >= start || timeInMinutes <= end;
      console.log(`✓ inNightRange: ${inNightRange}`);
      return inNightRange;
    }
  });
}

 

  export async function filterByLocation(records,location,range){

    const coords = await locationToCoordinates(location);
    if (!coords) {
      console.warn("Invalid coordinates, returning empty array");
      return [];
    }
    const { lat: location_lat, lon: location_lon } = coords;

    return records.filter(r =>
      haversineDistance(r.lat,r.lon, location_lat, location_lon) <= range
    );
  }
  



  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
  
    //inline function to convert degrees to radians
    const toRad = deg => deg * Math.PI / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }
  


  async function locationToCoordinates(location) {
    if (!location || location.trim() === "") {
      console.warn("Empty location provided");
      return null;
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    
    try {
              const response = await fetch(url, {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'ImLearning/1.0 (ivandallaragions@gmail.com)'
                }
              });
              
              
              const coordinates = await response.json();
          
              if (coordinates.length > 0) {

                const { lat, lon } = coordinates[0];
                console.log(`in loc to coordinate Latitude: ${lat}, Longitude: ${lon}`);
                return { 
                      lat: parseFloat(lat),
                      lon : parseFloat(lon)}
              }
              
              else {
                console.log("No results found");
                alert("No place found, please try again.");
              }
            } 
            
            catch (error) {
              console.error("Error during the request", error);
            }
        }
