import AmadeusAPI from '@/AmadeusAPI';
import GenericAPI, { MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from '@/GenericAPI';
import exposeServer from '@/ngrok';
import express, { Request, Response } from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const api: GenericAPI = new AmadeusAPI();

// Expose the local dev server
(async () => {
  await exposeServer("127.0.0.1", PORT); 
})();

app.use(express.json()); // add this before any routes

app.get('/hello', (_: Request, res: Response) => {
  res.send('Hello world!');
});

app.post('/api/searchFlightsOneWay', async (req: Request, res: Response) => {
  try {
    const query: OneWayQueryParams = req.body;
    const data = await api.searchFlightsOneWay(query);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/searchFlightsRoundTrip', async (req: Request, res: Response) => {
  try {
    const query: RoundTripQueryParams = req.body;
    const data = await api.searchFlightsRoundTrip(query);
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

// const queryType: QueryType = "roundTrip"; 
// const fieldInputs: FieldInputs = {
//   "originAirport": "JFK",
//   "destinationAirport": "LAX",
//   "startDate": new Date(2026, 5, 10),
//   "endDate": new Date(2026, 5, 20),
//   // "numAdults": 1,
//   // "numSeniors": 0,
//   // "numYouths": 0,
//   // "numChildren": 0,
//   // "numInfantsInSeat": 0,
//   // "numInfantsInLap": 0,
//   // "stops": "No limit",
//   // "extraStops": "Up to 1 extra stop",
//   // "currency": "United States Dollar (USD)",
//   // "salesCity": "New York",
//   // "cabin": "Cheapest available",
//   // "allowAirportChanges": true,
//   // "onlyShowAvailableFlights": true,
// };