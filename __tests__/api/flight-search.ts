import { Flight, FlightDealsParams, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from '@/skyboundTypes/SkyboundAPI';
import * as dotenv from 'dotenv';
const NGROK_ENV_FILE = '.env.ngrok.local';
const TEST_ENV_FILE = '.env.test.local';

// Give quite a bit of tolerance waiting for amadeus to respond
const AMADEUS_TIMEOUT = 20_000;

if (process.env.USE_NGROK === 'true') {
  // Only attempt to load the .env.ngrok.local file if USE_NGROK is true
  const result = dotenv.config({ path: NGROK_ENV_FILE });

  if (result.error) {
    console.warn(`env file (${NGROK_ENV_FILE}) not found, using default values.`);
  }
}

const API_URL: string = process.env.NGROK_URL || 'http://129.80.33.141:4000';
console.log(`Using API URL ${API_URL}`);

// Always load TEST_ENV_FILE
dotenv.config({ path: TEST_ENV_FILE });

// Expect that TEST_ENV_FILE is populated with TEST_BYPASS_TOKEN, else throw error
const TEST_BYPASS_TOKEN = process.env.TEST_BYPASS_TOKEN;
if (!TEST_BYPASS_TOKEN) {
  throw new Error(`TEST_BYPASS_TOKEN is not set in ${TEST_ENV_FILE}`);
}

// Utility function for HTTP GET requests to API
async function apiGet(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${TEST_BYPASS_TOKEN}`,
    },
  });
  const json = await res.json();
  return { status: res.status, json };
}

// Utility function for HTTP POST requests to API
async function apiPost(endpoint: string, params: object) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_BYPASS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  return { status: res.status, json };
}

// Heuristic to check if a json object is probably a Flight
// not completely reliable, but reliable enough to make sure the API isn't spitting out complete junk
function assertIsFlight(obj: Flight) {
  expect(typeof obj).toBe("object");
  expect(obj).toBeDefined();
  expect(typeof obj.price).toBe("number");
  expect(typeof obj.airline).toBe("object");
  expect(typeof obj.freeBaggage).toBe("boolean");
  expect(Array.isArray(obj.outbound));
  expect((obj.return === undefined || Array.isArray(obj.return)));
}

describe.only("GET /hello", () => {
  it("should return Hello world!", async () => {
    const { status, json } = await apiGet("/hello");

    expect(status).toBe(200);
    expect(json).toEqual({ hello: "Hello world!" });
  });
});


describe("POST /api/flightDeals", () => {
  it("should return cheap flights based on an origin airport (IATA code)", async () => {
    const params: FlightDealsParams = {
      originAirportIATA: 'BUF',
    };

    const { status, json } = await apiPost("/api/flightDeals", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);
});

describe("POST /api/searchFlightsOneWay", () => {
  it("should return a list of flights (when searching with no flexible airports/dates)", async () => {
    const params: OneWayQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: [],
      flexibleDates: false,
      date: new Date('2026-05-10'),
    };

    const { status, json } = await apiPost("/api/searchFlightsOneWay", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);

  it("should return a list of flights (when searching with flexible dates)", async () => {
    const params: OneWayQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: [],
      flexibleDates: true,
      date: new Date('2026-05-10'),
    };

    const { status, json } = await apiPost("/api/searchFlightsOneWay", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);

  it("should return a list of flights (when searching with flexible airports)", async () => {
    const params: OneWayQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: ["OAK", "SFO", "NGZ"],
      flexibleDates: true,
      date: new Date('2026-05-10'),
    };

    const { status, json } = await apiPost("/api/searchFlightsOneWay", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);
});

describe("POST /api/searchFlightsRoundTrip", () => {
  it("should return a list of flights (when searching with no flexible airports/dates)", async () => {
    const params: RoundTripQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: [],
      flexibleDates: false,
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-15')
    };

    const { status, json } = await apiPost("/api/searchFlightsRoundTrip", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);

  it("should return a list of flights (when searching with flexible dates)", async () => {
    const params: RoundTripQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: [],
      flexibleDates: true,
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-15')
    };

    const { status, json } = await apiPost("/api/searchFlightsRoundTrip", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);

  it("should return a list of flights (when searching with flexible airports)", async () => {
    const params: RoundTripQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: ["OAK", "SFO", "NGZ"],
      flexibleDates: true,
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-15')
    };

    const { status, json } = await apiPost("/api/searchFlightsRoundTrip", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);
});

describe("POST /api/searchFlightsMultiCity", () => {
  it("should return a list of flights (when searching without flexible dates)", async () => {
    const params: MultiCityQueryParams = {
      legs: [
        {
          originAirportIATA: "JFK",
          destinationAirportIATA: "ORD",
          date: new Date('2026-01-10'),
        },
        {
          originAirportIATA: "ORD",
          destinationAirportIATA: "LAX",
          date: new Date('2026-01-10'),
        }
      ],
      flexibleDates: false,
    };

    const { status, json } = await apiPost("/api/searchFlightsMultiCity", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);

  it("should return a list of flights (when searching with flexible dates)", async () => {
    const params: MultiCityQueryParams = {
      legs: [
        {
          originAirportIATA: "JFK",
          destinationAirportIATA: "ORD",
          date: new Date('2026-01-10'),
        },
        {
          originAirportIATA: "ORD",
          destinationAirportIATA: "LAX",
          date: new Date('2026-01-10'),
        }
      ],
      flexibleDates: true,
    };

    const { status, json } = await apiPost("/api/searchFlightsMultiCity", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);
});