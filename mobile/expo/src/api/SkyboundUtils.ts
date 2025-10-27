import Constants from 'expo-constants';

export async function skyboundRequest(endpoint: string, params: object) {
  try {
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    const response = await fetch(`${API_URL}/api/${endpoint}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Skybound API call failed: ', err);
  }
}
