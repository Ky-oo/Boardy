export type GoogleCredentialResponse = {
  credential: string;
};

type RenderGoogleButtonOptions = {
  element: HTMLElement;
  clientId: string;
  callback: (response: GoogleCredentialResponse) => void;
};

declare global {
  interface Window {
    google?: any;
  }
}

let googleScriptPromise: Promise<void> | null = null;

export const loadGoogleIdentity = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity not available"));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-google-identity="true"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity"));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export const renderGoogleButton = async ({
  element,
  clientId,
  callback,
}: RenderGoogleButtonOptions) => {
  if (!element || !clientId) return;
  await loadGoogleIdentity();
  if (element.childElementCount > 0) return;

  window.google?.accounts?.id.initialize({
    client_id: clientId,
    callback,
  });

  window.google?.accounts?.id.renderButton(element, {
    theme: "outline",
    size: "large",
    shape: "pill",
    width: 220,
  });
};
