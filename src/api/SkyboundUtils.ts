import Constants from 'expo-constants';
import { getAuth } from "firebase/auth";

// This module contains utility functions for interacting with our internal API

// Recursively finds dates in a returned JSON and converts to actual JS Date values
export function reviveDates<T>(data: T): T {
  // ISO 8601 regex for most common date-time formats
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

  if (data === null || data === undefined) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => reviveDates(item)) as unknown as T;
  }

  // Handle objects
  if (typeof data === "object" && !(data instanceof Date)) {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string" && isoDateRegex.test(value)) {
        result[key] = new Date(value);
      } else {
        result[key] = reviveDates(value);
      }
    }
    return result;
  }

  // Everything else (primitives, functions, etc.)
  return data;
}

export function getURL() {
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  if (API_URL === undefined) {
    throw new Error('API_URL (URL for our internal API) is undefined. Requests will not work.');
  }

  return `${API_URL}/api`;
}

// Make a post request to the internal API
export async function skyboundRequest(endpoint: string, params: object) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("Internal API request failed: not logged in");
  const idToken = await user.getIdToken();

  const fullURL = `${getURL()}/${endpoint}/`;
  console.log(`Sending query to endpoint ${fullURL}`);

  const response = await fetch(fullURL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const json = await response.json();

  if (!response.ok) {
    const errorMessage = (json.error !== undefined)
      ? json.error
      : json.message || 'Unknown error';

    throw new Error(`HTTP error ${response.status}: ${errorMessage}`);
  }

  return json;
}

// Helper to parse "Dec 20, 2000" safely in React Native
export function parseFriendlyDate(dateStr: string): Date {
  // 1. Try standard construction first (for safety if format changes later)
  const directDate = new Date(dateStr);
  if (!isNaN(directDate.getTime())) return directDate;

  // 2. Manual Parse for "MMM DD, YYYY"
  const months: { [key: string]: number } = { 
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, 
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 
  };

  // Split "Dec 20, 2000" -> ["Dec", "20,", "2000"]
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const monthStr = parts[0]; 
    const dayStr = parts[1].replace(',', '');
    const yearStr = parts[2];

    const monthIndex = months[monthStr];
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);

    if (monthIndex !== undefined && !isNaN(day) && !isNaN(year)) {
      // Note: Month is 0-indexed in JS Date
      return new Date(year, monthIndex, day);
    }
  }

  throw new Error(`Cannot parse date string: "${dateStr}"`);
}
