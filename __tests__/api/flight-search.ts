import { Flight, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from '@/skyboundTypes/SkyboundAPI';
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
console.log(`Using API URL ${API_URL}`);

// Give quite a bit of tolerance waiting for amadeus to respond
const AMADEUS_TIMEOUT = 20_000;

async function apiGet(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`);
  const json = await res.json();
  return { status: res.status, json };
}

async function apiPost(endpoint: string, params: object) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  return { status: res.status, json };
}

function assertIsFlight(obj: Flight) {
  expect(typeof obj).toBe("object");
  expect(obj).toBeDefined();
  expect(typeof obj.price).toBe("number");
  expect(typeof obj.airline).toBe("object");
  expect(typeof obj.freeBaggage).toBe("boolean");
  expect(Array.isArray(obj.outbound));
  expect((obj.return === undefined || Array.isArray(obj.return)));
}

describe("GET /hello", () => {
  it("should return Hello world!", async () => {
    const { status, json } = await apiGet("/hello");

    expect(status).toBe(200);
    expect(json).toEqual({ hello: "Hello world!" });
  });
});

describe("POST /api/searchFlightsOneWay", () => {
  it("should return ", async () => {
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
});

describe("POST /api/searchFlightsOneWay (with flexible dates)", () => {
  it("should return ", async () => {
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
});

describe.only("POST /api/searchFlightsOneWay (with flexible airports)", () => {
  it("should return ", async () => {
    const params: OneWayQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: ["LGB", "BUR", "SNA", "ONT", "SMO"],
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
  it("should return ", async () => {
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
});

describe("POST /api/searchFlightsRoundTrip (with flexible dates)", () => {
  it("should return ", async () => {
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
});

describe("POST /api/searchFlightsMultiCity", () => {
  it("should return ", async () => {
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
      flexibleAirports: [],
      flexibleDates: false,
    };

    const { status, json } = await apiPost("/api/searchFlightsMultiCity", params);
    expect(status).toBe(200);
    for (const flight of json) {
      assertIsFlight(flight);
    }
  }, AMADEUS_TIMEOUT);
});

describe("POST /api/searchFlightsMultiCity (with flexible dates)", () => {
  it("should return ", async () => {
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