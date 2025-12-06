import * as dotenv from 'dotenv';

const ENV_FILE = '.env.ngrok.local';

if (process.env.USE_NGROK === 'true') {
  // Only attempt to load the .env.ngrok.local file if USE_NGROK is true
  const result = dotenv.config({ path: ENV_FILE });

  if (result.error) {
    console.warn(`env file (${ENV_FILE}) not found, using default values.`);
  }
}

// Use a fallback value for API_URL if USE_NGROK is true and the variable isn't set, or if USE_NGROK is false
export default ({ config }) => ({
  ...config,
  owner: "ejd5757",
  extra: {
    ...config.extra,        // keep everything from app.json
    API_URL: process.env.NGROK_URL || 'http://129.80.33.141:4000',
  },
  plugins: [
    "expo-web-browser",
  ]
});
