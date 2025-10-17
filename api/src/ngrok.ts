import ngrok from '@ngrok/ngrok';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import fs from 'fs-extra';

export default async function exposeServer(ipv4: string, port: number) {
  try {
    const ENV_FILE = '/.env.ngrok.local';
    dotenv.config({ path: ENV_FILE });
    const TOKEN = process.env.NGROK_AUTHTOKEN;
    if (!TOKEN) {
      throw new Error(`NGROK_AUTHTOKEN is not set in ${ENV_FILE}`);
    }

    console.log('Attempting to create ngrok config file (if not existing)...');
    execSync(`npx ngrok config add-authtoken ${TOKEN}`, { stdio: 'inherit' });

    console.log(`Starting ngrok tunnel on port ${port}...`);
    const listener = await ngrok.forward({
      addr: `${ipv4}:${port}`,
      authtoken: TOKEN,
      proto: "http",
    });
    console.log(`ngrok tunnel established at: ${listener.url()}`);

    await fs.writeFile(ENV_FILE, `NGROK_AUTHTOKEN=${TOKEN}\nNGROK_URL=${listener.url()}\n`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}