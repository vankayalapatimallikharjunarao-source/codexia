import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App and Auth
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Meet Scopes
provider.addScope("https://www.googleapis.com/auth/meetings.space.created");
provider.addScope("https://www.googleapis.com/auth/meetings.space.readonly");
provider.addScope("https://www.googleapis.com/auth/meetings.space.settings");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need to be refreshed or acquired via sign-in popup
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Initiate Google Sign-In popup with required scopes
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get OAuth access token from Google identity provider");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error.code === "auth/popup-closed-by-user" || 
      error.code === "auth/popup-blocked" || 
      error.code === "auth/cancelled-popup-request" ||
      error.message?.includes("popup-closed-by-user") ||
      error.message?.includes("popup-blocked")
    ) {
      console.warn("Google Sign-In popup closed or blocked by user/iframe:", error.message || error);
      throw new Error(
        "Sign-In Blocked/Closed: Since the app is running in an iframe preview, please click 'Open in new tab' (top-right icon of the preview pane) to bypass browser iframe restrictions, or check your browser's popup blocker settings."
      );
    }
    console.error("Google Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve currently cached access token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign out and clear session cache
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Creates a real Google Meet space using the official REST API.
 * Endpoint: POST https://meet.googleapis.com/v2/spaces
 */
export interface MeetSpaceResponse {
  name: string;
  meetingUri: string;
  meetingCode: string;
  config?: {
    accessType?: string;
  };
}

export const createMeetSpace = async (token: string): Promise<MeetSpaceResponse> => {
  const response = await fetch("https://meet.googleapis.com/v2/spaces", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Google Meet Space API Error:", errText);
    throw new Error(`Google Meet Space generation failed: ${response.statusText} (${errText})`);
  }

  const data: MeetSpaceResponse = await response.json();
  return data;
};
