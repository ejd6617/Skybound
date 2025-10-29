import * as dotenv from 'dotenv';
const ENV_FILE = '../../.env.ngrok.local';
dotenv.config({ path: ENV_FILE });

export default ({ config }) => ({
  ...config,
  extra: {
    API_URL: process.env.NGROK_URL,
  },
});
