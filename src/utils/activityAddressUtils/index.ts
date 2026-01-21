export const formatShortAddress = (activity: {
  place_name?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
}) => {
  const address = activity.address?.trim() || "";
  const city = activity.city?.trim() || "";
  const postalCodeRaw = activity.postalCode?.trim() || "";

  const postalCode = postalCodeRaw === "00000" ? "" : postalCodeRaw;

  let addressDisplay = address ? normalizeAddressDisplay(address) : "";
  if (addressDisplay && city) {
    addressDisplay = removeTrailingCity(addressDisplay, city);
  }

  if (addressDisplay) return addressDisplay;

  const parts = [postalCode, city].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return "Adresse indisponible";
};

export const getAddressHref = (activity: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  place_name?: string | null;
}) => {
  const lat = activity.latitude;
  const lon = activity.longitude;
  if (typeof lat === "number" && typeof lon === "number") {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }

  const parts = [activity.address]
    .map((p) => p?.trim())
    .filter(Boolean) as string[];

  if (!parts.length) return null;
  const query = encodeURIComponent(parts.join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const normalizeAddressDisplay = (value: string) => {
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const secondPart = parts[1] ?? "";
  if (parts.length >= 2 && /^\d/.test(secondPart)) {
    parts.shift();
  }

  const cleaned = parts.filter((p) => {
    const lower = p.toLowerCase();
    if (lower === "france") return false;
    if (lower.includes("france")) return false;
    if (lower.includes("métropolitaine") || lower.includes("metropolitaine")) {
      return false;
    }
    return true;
  });

  const postcodeIndex = cleaned.findIndex((p) => /^\d{5}$/.test(p));
  const postcode =
    postcodeIndex >= 0 ? cleaned.splice(postcodeIndex, 1)[0] : "";

  const kept = cleaned.slice(0, 3);
  if (postcode && !kept.includes(postcode)) {
    kept.push(postcode);
  }

  return kept.join(", ");
};

const removeTrailingCity = (value: string, city: string) => {
  const trimmedCity = city.trim();
  if (!trimmedCity) return value;

  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const last = parts[parts.length - 1];
  if (
    last &&
    last.localeCompare(trimmedCity, undefined, { sensitivity: "base" }) === 0
  ) {
    parts.pop();
  }

  return parts.join(", ");
};
