import Constants from 'expo-constants';

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

// Make a request to the internal API
export async function skyboundRequest(endpoint: string, params: object) {
  const response = await fetch(`${getURL()}/${endpoint}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const json: any = await response.json();
  console.log(JSON.stringify(json, null, 2));
  return json;
}
