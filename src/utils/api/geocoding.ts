export type AddressSuggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export type GeocodeResult = {
  lat: number;
  lon: number;
};

const buildSearchUrl = (query: string, limit: number) => {
  const encoded = encodeURIComponent(query);
  return `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encoded}&addressdetails=1&accept-language=fr&countrycodes=fr`;
};

export const fetchAddressSuggestions = async (
  query: string,
  limit = 5
): Promise<AddressSuggestion[]> => {
  const response = await fetch(buildSearchUrl(query, limit));
  if (!response.ok) {
    throw new Error("Impossible de rechercher l'adresse");
  }

  const results = await response.json();
  return Array.isArray(results) ? results : [];
};

export const geocodeAddress = async (
  query: string
): Promise<GeocodeResult | null> => {
  const results = await fetchAddressSuggestions(query, 1);
  if (!results.length) return null;

  const lat = Number(results[0]?.lat);
  const lon = Number(results[0]?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { lat, lon };
};
