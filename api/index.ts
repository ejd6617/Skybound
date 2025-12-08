import AmadeusAPI from '@/AmadeusAPI';
import { authenticate, AuthenticatedRequest, getAdminCredential } from "@/auth";
import { createCacheMiddleware } from "@/caching";
import abbreviatedLog from '@/logging';
import exposeServer from '@/ngrok';
import SkyboundAPI, { FlightDealsParams, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from "@skyboundTypes/SkyboundAPI";
import express, { Response } from 'express';
import admin from "firebase-admin";
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
const app = express();
const api: SkyboundAPI = new AmadeusAPI();

const NGROK_PORT = 5050;
const HTTP_PORT = Number(process.env.HTTP_PORT) || 6060;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 7070;
const USE_NGROK = process.env.USE_NGROK === 'true';
const USE_HTTP = process.env.USE_HTTP === 'true';
const DOMAIN = 'skybound-api.xyz';

const privateKeyPath = `/certs/live/skybound-api.xyz/privkey.pem`;
const fullChainPath = `/certs/live/skybound-api.xyz/fullchain.pem`;

const shortCache = createCacheMiddleware(120);
const longCache = createCacheMiddleware(600);

admin.initializeApp(getAdminCredential());
app.use(express.json());

app.use('/api/logos', express.static('./logos'));

app.get('/hello', authenticate, (_: AuthenticatedRequest, res: Response) => {
  res.json({hello: 'Hello world!'});
});

app.post('/api/flightDeals', longCache, authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query: FlightDealsParams = req.body;
    abbreviatedLog("Input", query, Infinity);
    const data = await api.getFlightDeals(query);
    abbreviatedLog("Output", data, 50);
    res.json(data);
  } catch (error) {
    console.error('Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/searchFlightsOneWay', shortCache, authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query: OneWayQueryParams = req.body;
    abbreviatedLog("Input", query, Infinity);
    const data = await api.searchFlightsOneWay(query);
    abbreviatedLog("Output", data, 50);
    res.json(data);
  } catch (error) {
    console.error('Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/searchFlightsRoundTrip', shortCache, authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query: RoundTripQueryParams = req.body;
    abbreviatedLog("Input", query, Infinity);
    const data = await api.searchFlightsRoundTrip(query);
    abbreviatedLog("Output", data);
    res.json(data);
  } catch (error) {
    console.error('Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/searchFlightsMultiCity', shortCache, authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query: MultiCityQueryParams = req.body;
    abbreviatedLog("Input", query, Infinity);
    const data = await api.searchFlightsMultiCity(query);
    abbreviatedLog("Output", data);
    res.json(data);
  } catch (error) {
    console.error('Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

if (USE_NGROK) {
  (async () => { await exposeServer("127.0.0.1", NGROK_PORT); })();
  app.listen(NGROK_PORT, "127.0.0.1", () => {
    console.log(`Local Express server running on ${NGROK_PORT} for Ngrok.`);
  });
} else {
  if (USE_HTTP) {
    app.listen(HTTP_PORT, "0.0.0.0", () => {
      console.log(`API server is listening on port ${HTTP_PORT} on all network interfaces (HTTP only)`);
    });
  } else {
    http.createServer((req, res) => {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
    }).listen(HTTP_PORT, "0.0.0.0", () => {
      console.log(`HTTP Redirect server listening on port ${HTTP_PORT} for ${DOMAIN}`);
    });

    try {
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      const certificate = fs.readFileSync(fullChainPath, 'utf8');

      const credentials = { key: privateKey, cert: certificate };

      https.createServer(credentials, app).listen(HTTPS_PORT, "0.0.0.0", () => {
        console.log(`HTTPS API server listening securely on port ${HTTPS_PORT} on all network interfaces`);
      });
    } catch (error) {
      console.error(`Failed to start HTTPS server: Error reading certificate files at ${privateKeyPath}.`);
      console.error("Make sure Certbot has run and the files exist and are readable by this process.");
    }
  }
}
