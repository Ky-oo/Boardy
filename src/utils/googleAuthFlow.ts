import {
  renderGoogleButton,
  type GoogleCredentialResponse,
} from "@/utils/googleAuth";

export type { GoogleCredentialResponse };

export type GoogleProfile = {
  firstname?: string;
  lastname?: string;
  email?: string;
  picture?: string;
};

export type GooglePrefill = {
  idToken: string;
  profile?: GoogleProfile;
};

type InitGoogleButtonOptions = {
  element: HTMLElement | null;
  onCredential: (response: GoogleCredentialResponse) => void;
  onError?: (error: unknown) => void;
  clientId?: string;
};

const STORAGE_KEY = "googleAuth";

export const saveGooglePrefill = (prefill: GooglePrefill) => {
  if (!prefill?.idToken) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prefill));
};

export const consumeGooglePrefill = (): GooglePrefill | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.idToken) return null;
    return { idToken: parsed.idToken, profile: parsed.profile };
  } catch {
    return null;
  } finally {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};

export const initGoogleButton = async ({
  element,
  onCredential,
  onError,
  clientId,
}: InitGoogleButtonOptions) => {
  const resolvedClientId =
    clientId || (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined);
  if (!resolvedClientId || !element) return;
  try {
    await renderGoogleButton({
      element,
      clientId: resolvedClientId,
      callback: onCredential,
    });
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      console.error("Google button error:", error);
    }
  }
};
