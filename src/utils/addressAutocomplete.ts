import { ref, type Ref } from "vue";
import {
  fetchAddressSuggestions,
  geocodeAddress,
  type AddressSuggestion,
  type GeocodeResult,
} from "@/utils/api/geocoding";

type AutocompleteOptions = {
  address: Ref<string>;
  location?: Ref<string>;
  latitude: Ref<number | null>;
  longitude: Ref<number | null>;
};

export const useAddressAutocomplete = (options: AutocompleteOptions) => {
  const { address, location, latitude, longitude } = options;
  const addressSuggestions = ref<AddressSuggestion[]>([]);
  const addressLoading = ref(false);
  const showAddressSuggestions = ref(false);

  let addressSearchTimeout: number | null = null;
  let lastAddressQuery = "";

  const buildAddressQuery = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return trimmed;
  };

  const fetchSuggestions = async (raw: string) => {
    const query = buildAddressQuery(raw);
    if (!query) {
      lastAddressQuery = "";
      addressSuggestions.value = [];
      addressLoading.value = false;
      return;
    }

    lastAddressQuery = query;
    addressLoading.value = true;

    try {
      const results = await fetchAddressSuggestions(query, 5);
      if (lastAddressQuery !== query) return;
      addressSuggestions.value = results;
    } catch {
      if (lastAddressQuery === query) {
        addressSuggestions.value = [];
      }
    } finally {
      if (lastAddressQuery === query) {
        addressLoading.value = false;
      }
    }
  };

  const handleAddressInput = () => {
    latitude.value = null;
    longitude.value = null;
    showAddressSuggestions.value = true;

    if (addressSearchTimeout !== null) {
      window.clearTimeout(addressSearchTimeout);
    }

    const raw = address.value;
    if (raw.trim().length < 3) {
      lastAddressQuery = "";
      addressSuggestions.value = [];
      addressLoading.value = false;
      return;
    }

    addressSearchTimeout = window.setTimeout(() => {
      fetchSuggestions(raw);
    }, 300);
  };

  const handleAddressBlur = () => {
    window.setTimeout(() => {
      showAddressSuggestions.value = false;
    }, 150);
  };

  const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
    address.value = suggestion.display_name;
    latitude.value = Number(suggestion.lat);
    longitude.value = Number(suggestion.lon);
    addressSuggestions.value = [];
    addressLoading.value = false;
    showAddressSuggestions.value = false;
  };

  const geocodeLocation = async (): Promise<GeocodeResult | null> => {
    if (latitude.value !== null && longitude.value !== null) {
      return { lat: latitude.value, lon: longitude.value };
    }

    const parts = [location?.value?.trim(), address.value?.trim()].filter(
      Boolean
    );
    const query = parts.join(", ");

    if (!query) return null;

    const result = await geocodeAddress(query);
    if (result) {
      latitude.value = result.lat;
      longitude.value = result.lon;
    }

    return result;
  };

  return {
    addressSuggestions,
    addressLoading,
    showAddressSuggestions,
    handleAddressInput,
    handleAddressBlur,
    selectAddressSuggestion,
    geocodeLocation,
  };
};
