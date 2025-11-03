import Constants from 'expo-constants';

export async function skyboundRequest(endpoint: string, params: object) {
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  if (API_URL === undefined) {
    throw new Error('API_URL (URL for our internal API) is undefined. Requests will not work.');
  }

  const response = await fetch(`${API_URL}/api/${endpoint}/`, {
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
