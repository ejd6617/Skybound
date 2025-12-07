import * as dotenv from 'dotenv';

const ENV_FILE = '.env.ngrok.local';

if (process.env.USE_NGROK === 'true') {
  // Only attempt to load the .env.ngrok.local file if USE_NGROK is true
  const result = dotenv.config({ path: ENV_FILE });

  if (result.error) {
    console.warn(`env file (${ENV_FILE}) not found, using default values.`);
  }
}

// Use old URL if connecting over plain http
const ORACLE_URL = USE_HTTP ? "http://129.80.33.141" : "https://skybound-api.xyz"

export default ({ config }) => ({
  ...config,
  owner: "ejd5757",
  extra: {
    ...config.extra,        // keep everything from app.json
    API_URL: process.env.NGROK_URL || ORACLE_URL,
  },
  plugins: [
    "expo-web-browser",
  ]
});
