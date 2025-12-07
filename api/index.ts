import AmadeusAPI from '@/AmadeusAPI';
import { authenticate, AuthenticatedRequest, getAdminCredential } from "@/auth";
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

const HTTP_PORT = Number(process.env.HTTP_PORT) || 80;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 443;
const USE_HTTP = process.env.USE_HTTPS === 'true';
const USE_NGROK = process.env.USE_NGROK === 'true';
const PORT = USE_HTTP ? HTTP_PORT : HTTPS_PORT;
const DOMAIN = 'skybound-api.xyz';

const privateKeyPath = `/cert/privkey.pem`;
const fullChainPath = `/cert/fullchain.pem`;

admin.initializeApp(getAdminCredential());
app.use(express.json());

app.use('/api/logos', express.static('./logos'));

app.get('/hello', authenticate, (_: AuthenticatedRequest, res: Response) => {
  res.json({hello: 'Hello world!'});
});

app.post('/api/flightDeals', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

app.post('/api/searchFlightsOneWay', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

app.post('/api/searchFlightsRoundTrip', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

app.post('/api/searchFlightsMultiCity', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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
  (async () => { await exposeServer("127.0.0.1", PORT); })();
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
