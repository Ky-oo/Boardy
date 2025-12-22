export type UserLocation = {
  city: string;
  latitude: number;
  longitude: number;
};

export type UserLocationErrorCode =
  | "unsupported"
  | "permission_denied"
  | "position_unavailable"
  | "timeout"
  | "reverse_geocode_failed"
  | "city_not_found"
  | "unknown";

export class UserLocationError extends Error {
  code: UserLocationErrorCode;

  constructor(code: UserLocationErrorCode, message: string) {
    super(message);
    this.name = "UserLocationError";
    this.code = code;
  }
}

type UserLocationOptions = {
  language?: string;
  geolocation?: PositionOptions;
};

const buildReverseUrl = (
  latitude: number,
  longitude: number,
  language: string
) =>
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${encodeURIComponent(
    language
  )}`;

const mapGeolocationErrorCode = (
  error: GeolocationPositionError
): UserLocationErrorCode => {
  switch (error.code) {
    case 1:
      return "permission_denied";
    case 2:
      return "position_unavailable";
    case 3:
      return "timeout";
    default:
      return "unknown";
  }
};

const getPosition = (options?: PositionOptions) =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new UserLocationError("unsupported", "Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

export const getUserLocation = async (
  options: UserLocationOptions = {}
): Promise<UserLocation> => {
  try {
    const position = await getPosition(options.geolocation);
    const { latitude, longitude } = position.coords;
    const response = await fetch(
      buildReverseUrl(latitude, longitude, options.language || "fr")
    );

    if (!response.ok) {
      throw new UserLocationError(
        "reverse_geocode_failed",
        "Reverse geocoding failed"
      );
    }

    const data = await response.json();
    const address = data?.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "";

    if (!city) {
      throw new UserLocationError("city_not_found", "City not found");
    }

    return {
      city,
      latitude,
      longitude,
    };
  } catch (error) {
    if (error instanceof UserLocationError) {
      throw error;
    }

    if (error && typeof error === "object" && "code" in error) {
      const code = mapGeolocationErrorCode(error as GeolocationPositionError);
      throw new UserLocationError(code, "Geolocation error");
    }

    throw new UserLocationError("unknown", "Unknown location error");
  }
};
