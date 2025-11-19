import AmadeusAPI from '@/AmadeusAPI';
import { authenticate, AuthenticatedRequest } from "@/auth";
import abbreviatedLog from '@/logging';
import exposeServer from '@/ngrok';
import SkyboundAPI, { FlightDealsParams, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from "@skyboundTypes/SkyboundAPI";
import express, { Response } from 'express';
import admin from "firebase-admin";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const api: SkyboundAPI = new AmadeusAPI();

admin.initializeApp();
app.use(express.json());

// Logos are publicly accessible
app.use('/api/logos', express.static('./logos'));

// Expose the local dev server with NGROK (if USE_NGROK=true)
(async () => {
  if (process.env.USE_NGROK === 'true') {
    await exposeServer("127.0.0.1", PORT);
  }
})();

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server is listening on port ${PORT} on all network interfaces`);
});