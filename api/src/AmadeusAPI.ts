import airports from "@assets/airports.json";
import SkyboundAPI, { Airline, Airport, Flight, FlightDealsParams, FlightLeg, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams, TravelClass, Traveler } from "@skyboundTypes/SkyboundAPI";
import * as dotenv from 'dotenv';
import pLimit from 'p-limit';
const Amadeus = require('amadeus');

const ENV_FILE = '/.env.amadeus.local';

const AMADEUS_PROD = (process.env.AMADEUS_PROD === "true");

// Limits for the test environment
const MAX_AIRPORTS_PARALLEL = 1; // Limit the number of parallel requests allowed when running a flexible airports query
const MAX_AIRPORTS_TEST = 4; // Limit the number of sequential requests allowed when running a flexible airports query

// Limits for the production environment
const MAX_AIRPORTS_PROD = 8 // Limit the number of airports in general. Runs in parallel by default

// Function to intentionally limit parallel execution if necessary
const limit = (AMADEUS_PROD)
  ? ((callback) => { return Promise.resolve(callback()) })
  : pLimit(MAX_AIRPORTS_PARALLEL)

// Represents a generic response from the Amadeus API
export interface AmadeusResponse {
  statusCode: number;
  data: any;
  result?: any;
}

// Represents a "flight endpoint" (effectively an airport)
export interface AmadeusFlightEndPoint {
  iataCode: string;
}

interface JsonAirport {
  iata: string,
  city: string,
  name: string,
  country: string,
}

// Represents per-segment fare details
interface AmadeusFareDetail {
  includedCheckedBags?: {
    quantity?: number;
  };
  segmentId: string,
  cabin: TravelClass
}

// Contains per-segment fair details
interface AmadeusTravelerPricing {
  fareDetailsBySegment?: AmadeusFareDetail[];
}

// Represents a segment (or leg) of the flight
interface AmadeusSegment {
  id: number,
  duration: string,
  carrierCode: string, // carrierCode + number = flight number
  number: string,
  departure: {
    iataCode: string,
    at: string,
    terminal: string,
  },
  arrival: {
    iataCode: string,
    at: string,
    terminal: string,
  },

  includedCheckedBags?: {
    quantity?: number;
  };
}

// Represents a possible route from an origin to destination
// May include more than one segment/leg
interface AmadeusItinerary {
  segments?: AmadeusSegment[];
  duration: string;
}

// An offer of several itineraries
interface AmadeusOffer {
  travelerPricings?: AmadeusTravelerPricing[];
  itineraries?: AmadeusItinerary[];
}

export default class AmadeusAPI implements SkyboundAPI {
  private amadeus: typeof Amadeus | null = null;
  private baseFlightOfferParams = {
    sources: ["GDS"],
  };
   
  // Authenticate with AmadeusAPI upon creation of new object
  constructor() {
    dotenv.config({ path: ENV_FILE });

    // AMADEUS_PROD is not set in the env file, it's set in the docker compose
    if (process.env.AMADEUS_PROD === "true") {
      const AMADEUS_KEY_PROD = process.env.AMADEUS_KEY_PROD;
      if (!AMADEUS_KEY_PROD) {
        throw new Error(`AMADEUS_KEY_PROD is not set in ${ENV_FILE}`);
      }

      const AMADEUS_SECRET_PROD = process.env.AMADEUS_SECRET_PROD;
      if (!AMADEUS_SECRET_PROD) {
        throw new Error(`AMADEUS_SECRET_PROD is not set in ${ENV_FILE}`);
      }

      this.amadeus = new Amadeus({
        clientId: AMADEUS_KEY_PROD,
        clientSecret: AMADEUS_SECRET_PROD,
        hostname: "production"
      });
    } else {
      const AMADEUS_KEY = process.env.AMADEUS_KEY;
      if (!AMADEUS_KEY) {
        throw new Error(`AMADEUS_KEY is not set in ${ENV_FILE}`);
      }

      const AMADEUS_SECRET = process.env.AMADEUS_SECRET;
      if (!AMADEUS_SECRET) {
        throw new Error(`AMADEUS_SECRET is not set in ${ENV_FILE}`);
      }

      this.amadeus = new Amadeus({
        clientId: AMADEUS_KEY,
        clientSecret: AMADEUS_SECRET,
      });
    }
  }

  getFlightDeals(params: FlightDealsParams): Promise<Flight[]> {
    throw new Error("Method not implemented.");
  }
  
  private extractResponseFlights(response: AmadeusResponse|undefined): Flight[] {
    if (response == undefined) {
      throw new Error("Error in Amadeus backend: expected response from API, got undefined");
    }
    
    if (response.statusCode != 200) {
      const errorString: string = (response.result.errors !== undefined && Array.isArray(response.result.errors))
      ? "\n"+response.result.errors.map((error: any) => {JSON.stringify(error)}).join("\n")
      : "";
      throw new Error(`Error in Amadeus backend: expected status code 200, got ${response.statusCode}${errorString}`);
    }

    return this.parseFlights(response);
  }

  private processTravelers(travelers: Traveler[]): any[] {
    const DEFAULT_TRAVELER = {
      travelerType: "ADULT",
      nationality: "US",
      dateOfBirth: "2002-01-01",
    };

    if (travelers.length == 0 )
      return [DEFAULT_TRAVELER]

    return travelers.map((traveler, index) => {
      return {
        id: (index + 1).toString(),
        dateOfBirth: (traveler.dateOfBirth)
          ? this.toLocalISOString (new Date(traveler.dateOfBirth))
          : DEFAULT_TRAVELER.dateOfBirth ,
        travelerType: traveler.travelerType || DEFAULT_TRAVELER.travelerType,
        nationality: traveler.nationality || DEFAULT_TRAVELER.nationality,
      }
    })
  }

  private logAmadeusError(rawError: any) {
    if (!rawError) {
    console.error("An unknown and null/undefined error occurred.");
    return;
  }
  
  // --- 1. Handle Amadeus API errors (Likely the source of complex objects) ---
  if (rawError.response && rawError.response.result && rawError.response.result.errors) {
    const amadeusErrors = rawError.response.result.errors;
    
    // Log a header
    console.error("--- Amadeus API Error Details ---");

    // Log the primary message
    if (amadeusErrors.length > 0) {
      const firstError = amadeusErrors[0];
      const message = `Code: ${firstError.code}. Detail: ${firstError.detail || 'Unknown issue'}`;
      console.error(`Amadeus API Primary Error: ${message}`);
    } else {
      console.error("Amadeus API returned errors in an unexpected format.");
    }

    // Log the full JSON details for deep inspection
    try {
         console.error("Full Amadeus Error Response:", JSON.stringify(rawError.response.result.errors, null, 2));
      } catch (e) {
         console.error("Could not stringify full Amadeus error response.");
      }
      return;
    }

    // --- 2. Handle Standard JavaScript Error objects ---
    if (rawError instanceof Error) {
      // Log the human-readable message and the stack trace
      console.error(`--- Standard JavaScript Error ---`);
      console.error(`Error Message: ${rawError.message || rawError.name || "Error object with no message."}`);
      
      // Stack trace is critical for debugging
      if (rawError.stack) {
        console.error("Stack Trace:", rawError.stack);
      }
      return;
    }
    
    // --- 3. Handle Generic Objects or Primitive Types (Fallback) ---
    
    // Log a header
    console.error(`--- Generic Error or Thrown Value ---`);

    // Try to stringify any object or cast any primitive
    try {
      const loggedValue = (typeof rawError === 'object' && rawError !== null)
        ? JSON.stringify(rawError, null, 2)
        : String(rawError);
        
      console.error("Caught Value:", loggedValue);
    } catch (e) {
      console.error("Caught a value that could not be logged or stringified.");
    }
  }

  private async flexibleAirportsQuery(amadeusSearchFlights: Function, params: RoundTripQueryParams | OneWayQueryParams): Promise<Flight[]> {
    // Directly pass params if not using flexible airports
    if (params.flexibleAirports === undefined || params.flexibleAirports.length == 0)
      return await amadeusSearchFlights(params)

    const airports = (AMADEUS_PROD)
      ? params.flexibleAirports.slice(0, MAX_AIRPORTS_PROD)
      : params.flexibleAirports.slice(0, MAX_AIRPORTS_TEST);

    // Iterate over each airport, search for flights, and collect the results
    return (await Promise.all(
      airports.map(iata => limit(() => {
        params.originAirportIATA = iata;
        let flights = null;
        try {
          flights = amadeusSearchFlights(params);
        } catch(error) {
          console.error("There is an error in one of the flexible airports provided");
          this.logAmadeusError(error);
          flights = [];
        }
        return flights;
      }))
    )).flat();
  }

  // Round trip flight search endpoint
  async searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]> {
    // Make a singular query to amadeus
    const amadeusSearchFlights = async (params: RoundTripQueryParams): Promise<Flight[]> => {
      try {
        const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.post({
          ...this.baseFlightOfferParams,
          currencyCode: params.currencyCode,
          travelers: this.processTravelers(params.travelers),
          originDestinations: [
            {
              id: "1",
              originLocationCode: params.originAirportIATA,
              destinationLocationCode: params.destinationAirportIATA,
              departureDateTimeRange: {
                date: this.toLocalISOString(new Date(params.startDate)),
                ...(params.flexibleDates ? { dateWindow: "P3D" } : {}), // Optional 3 day window
              },
            },
            {
              id: "2",
              originLocationCode: params.destinationAirportIATA,
              destinationLocationCode: params.originAirportIATA,
              departureDateTimeRange: {
                date: this.toLocalISOString(new Date(params.endDate)),
                ...(params.flexibleDates ? { dateWindow: "P3D" } : {}), // Optional 3 day window
              },
            }
          ],
        });
        return this.extractResponseFlights(response);
      } catch (error) {
        console.error("There is an error in one of the flexible airports provided");
        this.logAmadeusError(error);
        return []
      }
    }

    return this.flexibleAirportsQuery(amadeusSearchFlights, params);
  }

  // One way flight search endpoint
  async searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]> {
    // Make a singular query to amadeus
    const amadeusSearchFlights = async (params: OneWayQueryParams): Promise<Flight[]> => {
      try {
        const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.post({
          ...this.baseFlightOfferParams,
          currencyCode: params.currencyCode,
          travelers: this.processTravelers(params.travelers),
          originDestinations: [
            {
              id: "1",
              originLocationCode: params.originAirportIATA,
              destinationLocationCode: params.destinationAirportIATA,
              departureDateTimeRange: {
                date: this.toLocalISOString(new Date(params.date)),
                ...(params.flexibleDates ? { dateWindow: "P3D" } : {}), // Optional 3 day window
              },
            }
          ],
        });
        
        return this.extractResponseFlights(response);
      } catch (error) {
        console.error("There is an error in one of the flexible airports provided");
        this.logAmadeusError(error);
        return []
      }
    }

    return this.flexibleAirportsQuery(amadeusSearchFlights, params);
  }

  // Multi city flight search endpoint
  async searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]> {
    const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.post({
      ...this.baseFlightOfferParams,
      currencyCode: params.currencyCode,
      travelers: this.processTravelers(params.travelers),
      originDestinations: params.legs.map((leg, index) => ({
        id: (index + 1).toString(),
        originLocationCode: leg.originAirportIATA,
        destinationLocationCode: leg.destinationAirportIATA,
        departureDateTimeRange: {
          date: this.toLocalISOString(new Date(leg.date)),
          ...(params.flexibleDates ? { dateWindow: "P3D" } : {}), // Optional 3 day window
        },
      })),
    });
    
    if (response == undefined) {
      throw new Error("Error in Amadeus backend: expected response from API, got undefined");
    }
    
    if (response.statusCode != 200) {
      const errorString: string = (response.result.errors !== undefined && Array.isArray(response.result.errors))
      ? "\n"+response.result.errors.map((error: any) => {JSON.stringify(error)}).join("\n")
      : "";
      throw new Error(`Error in Amadeus backend: expected status code 200, got ${response.statusCode}${errorString}`);
    }
    
    return this.parseFlights(response);
  }
  
  
  // ISO 8601 string -> number of minutes
  private parseISODuration(duration: string): number {
    if (duration === undefined) { return 0; }

    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
    const match = duration.match(regex);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
  }

  // Javascript date object -> ISO 8601 string (no hours/minutes/seconds, just date)
  private toLocalISOString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  
  // Amadeus flight search response -> Skybound Flights
  private parseFlights(json: AmadeusResponse): Flight[] {
    if (!json) {
      throw new Error("Error parsing flights from Amadeus API response: no response json provided");
    }
    
    if (!Array.isArray(json.data)) {
      throw new Error("Error parsing flights from Amadeus API response: json.data is not an array");
    }

    // Maps IATA airline codes to human-friendly airline names
    const carriersDict: { [iata: string]: string } =
      (json as any).result?.dictionaries?.carriers ||
      (json as any).dictionaries?.carriers ||
      {};
    
    return json.data.map((offer: any): Flight => {
      if (offer.itineraries.length == 0) {
        throw new Error("No itinerary associated with offer in Amadeus response");
      }
      
      const fareDetailsMap = Object.fromEntries(
        offer.travelerPricings[0].fareDetailsBySegment.map(
          (fareDetail: AmadeusFareDetail) => [fareDetail.segmentId, fareDetail]
        )
      );     
      
      // Determine if this is a one way flight (if we expect a return or not)
      const oneWay: boolean = (offer.itineraries.length == 1);

      // Build an airline object with an iata code and human-friendly name
      const iata = offer.validatingAirlineCodes[0];
      const airline: Airline = {
        iata: iata,
        name: carriersDict[iata],
      };

      // Flight has no return if one way
      const flight: Flight = (oneWay)
      ? {
        price: parseFloat(offer.price.grandTotal),
        currencyCode: offer.price.currencyCode,
        airline: airline,
        freeBaggage: this.hasFreeBaggage(offer),
        outbound: this.parseItinerary(offer.itineraries[0], fareDetailsMap),
        outboundDuration: this.parseISODuration(offer.itineraries[0].duration),
        travelers: [],
      }
      : {
        price: parseFloat(offer.price.grandTotal),
        currencyCode: offer.price.currencyCode,
        airline: airline,
        freeBaggage: this.hasFreeBaggage(offer),
        outbound: this.parseItinerary(offer.itineraries[0], fareDetailsMap),
        outboundDuration: this.parseISODuration(offer.itineraries[0].duration),
        return: this.parseItinerary(offer.itineraries[1], fareDetailsMap),
        returnDuration: this.parseISODuration(offer.itineraries[1].duration),
        travelers: [],
      };

      return flight;
    });
  }

  // Heuristic for determining if a flight offer has free baggage
  // Amadeus offer -> boolean
  private hasFreeBaggage(offer: AmadeusOffer): boolean {
    if (!offer) return false;

    // Check traveler-level fare details (most reliable source)
    if (Array.isArray(offer.travelerPricings)) {
      for (const traveler of offer.travelerPricings) {
        for (const fareDetail of traveler.fareDetailsBySegment ?? []) {
          const included = fareDetail?.includedCheckedBags;
          if (included && typeof included.quantity === "number" && included.quantity > 0) {
            return true;
          }
        }
      }
    }

    // Fallback: check segment-level baggage info if present
    if (Array.isArray(offer.itineraries)) {
      for (const itinerary of offer.itineraries) {
        for (const segment of itinerary.segments ?? []) {
          const included = segment?.includedCheckedBags;
          if (included && typeof included.quantity === "number" && included.quantity > 0) {
            return true;
          }
        }
      }
    }

    // Otherwise, assume no free checked bag included
    return false;
  }

  // Amadeus flight endpoint -> Skybound Airport
  private parseAirport(endpoint: AmadeusFlightEndPoint): Airport {
    const getAirport = (airportsDataSet: JsonAirport[], iataCode: string) => {
        return airportsDataSet.find(airport => airport.iata === iataCode.toUpperCase());
    }

    const foundAirport = getAirport(airports, endpoint.iataCode);

    if (!foundAirport) {
        throw new Error(`Airport with IATA code ${endpoint.iataCode} not found in dataset.`);
    }

    console.log(foundAirport);
    return foundAirport;
  }

  private getDurationInMinutes = (date1: Date, date2: Date) => {
    const timeDifferenceMs = date2.getTime() - date1.getTime();
    const minutes = timeDifferenceMs / 1000 / 60;
    return Math.abs(minutes);
  };
  
  // Amadeus itinerary -> FlightLeg[]
  private parseItinerary(itinerary: AmadeusItinerary, fareDetailsMap: {[segmentId: number]: AmadeusFareDetail}): FlightLeg[] {
    if (itinerary.segments === undefined) {
      return [];
    }

    return itinerary.segments?.map((leg:AmadeusSegment) => {
      const currentSegmentFareDetails = (leg.id in fareDetailsMap)
        ? { travelClass: fareDetailsMap[leg.id].cabin }
        : { travelClass: "ECONOMY" as TravelClass} // Default to economy
      
      return {
        from: this.parseAirport(leg.departure),
        to: this.parseAirport(leg.arrival),
        duration: this.getDurationInMinutes(new Date(leg.arrival.at), new Date(leg.departure.at)),
        date: new Date(leg.departure.at),
        departureTime: new Date(leg.departure.at),
        arrivalTime: new Date(leg.arrival.at),
        terminal: leg.departure.terminal,
        flightNumber: leg.carrierCode + leg.number,
        ... currentSegmentFareDetails
      };
    });
  }
}
