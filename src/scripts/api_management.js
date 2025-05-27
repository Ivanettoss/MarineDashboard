

export async function fetchData() {
    const response = await fetch("data/samples1000.json"); 
    if (!response.ok) {
      throw new Error("Errore nel caricamento dei dati");
    }
    return await response.json();
  }
  