import * as dotenv from 'dotenv';

const ENV_FILE = '.env.ngrok.local';

if (process.env.USE_NGROK === 'true') {
  // Only attempt to load the .env.ngrok.local file if USE_NGROK is true
  const result = dotenv.config({ path: ENV_FILE });

  if (result.error) {
    console.warn(`env file (${ENV_FILE}) not found, using default values.`);
  }
}

const API_URL:string = process.env.NGROK_URL || 'http://129.80.33.141:4000';

async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  const json = await res.json();
  return { status: res.status, json };
}

describe("GET /hello", () => {
  it("should return Hello world", async () => {
    const { status, json } = await apiGet("/hello");

    expect(status).toBe(200);
    expect(json).toEqual({ hello: "Hello world!" });
  });
});
