import GenericAPI, { MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from '@src/GenericAPI';
import ITAMatrixAPI from "@src/ITAMatrixAPI";
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 4000;
const api: GenericAPI = new ITAMatrixAPI();

// index.ts
app.use(express.json()); // add this before any routes

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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