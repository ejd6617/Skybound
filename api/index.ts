import AmadeusAPI from '@/AmadeusAPI';
import exposeServer from '@/ngrok';
import SkyboundAPI, { MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from "@skyboundTypes/SkyboundAPI";
import express, { Request, Response } from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const api: SkyboundAPI = new AmadeusAPI();

app.use(express.json()); // add this before any routes

app.use('/api/logos', express.static('./logos')); // Logos are publicly accessible

// Expose the local dev server with NGROK (if USE_NGROK=true)
(async () => {
  if (process.env.USE_NGROK === 'true') {
    await exposeServer("127.0.0.1", PORT);
  }
})();

app.get('/hello', (_: Request, res: Response) => {
  res.send('Hello world!');
});

app.post('/api/searchFlightsOneWay', async (req: Request, res: Response) => {
  try {
    const query: OneWayQueryParams = req.body;
    console.log(query);
    const data = await api.searchFlightsOneWay(query);
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/searchFlightsRoundTrip', async (req: Request, res: Response) => {
  try {
    const query: RoundTripQueryParams = req.body;
    console.log(query);
    const data = await api.searchFlightsRoundTrip(query);
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/searchFlightsMultiCity', async (req: Request, res: Response) => {
  try {
    const query: MultiCityQueryParams = req.body;
    const data = await api.searchFlightsMultiCity(query);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server is listening on port ${PORT} on all network interfaces`);
});