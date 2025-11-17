import SkyboundAPI, { Airline, Airport, Flight, FlightLeg, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams, TravelClass } from "@skyboundTypes/SkyboundAPI";
import * as dotenv from 'dotenv';
import pLimit from 'p-limit';
const Amadeus = require('amadeus');

const ENV_FILE = '/.env.amadeus.local';
const limit = pLimit(2); // Limit the number of parallel requests allowed when running a multi flight query

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
  departure: {
    iataCode: string,
    at: string,
  },
  arrival: {
    iataCode: string,
    at: string,
  },

  includedCheckedBags?: {
    quantity?: number;
  };
}

// Represents a possible route from an origin to destination
// May include more than one segment/leg
interface AmadeusItinerary {
  segments?: AmadeusSegment[];
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
    currencyCode: "USD",
    travelers: [
      {
        id: "1",
        travelerType: "ADULT"
      }
    ],
  };
   
  // Authenticate with AmadeusAPI upon creation of new object
  constructor() {
    dotenv.config({ path: ENV_FILE });

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

  // Round trip flight search endpoint
  async searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]> {
    // Make a singular query to amadeus
    const amadeusSearchFlights = async (params: RoundTripQueryParams): Promise<Flight[]> => {
      const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.post({
        ...this.baseFlightOfferParams,
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

    return (params.flexibleAirports !== undefined && params.flexibleAirports.length != 0)
    // If we have flexible airports, iterate over each airport, search for flights, and collect the results
    ? (await Promise.all(
      params.flexibleAirports.map(iata => limit(() => {
        params.originAirportIATA = iata;
        return amadeusSearchFlights(params);
      }
    )))).flat()
    // If not using flexible airports, directly pass params
    : (await amadeusSearchFlights(params));
  }

  // One way flight search endpoint
  async searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]> {
    // Make a singular query to amadeus
    const amadeusSearchFlights = async (params: OneWayQueryParams): Promise<Flight[]> => {
      const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.post({
        ...this.baseFlightOfferParams,
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

    return (params.flexibleAirports !== undefined && params.flexibleAirports.length != 0)
    // If we have flexible airports, iterate over each airport, search for flights, and collect the results
    ? (await Promise.all(
      params.flexibleAirports.map(iata => limit(() => {
        params.originAirportIATA = iata;
        return amadeusSearchFlights(params);
      }
    )))).flat()
    // If not using flexible airports, directly pass params
    : (await amadeusSearchFlights(params));
  }

  // Multi city flight search endpoint
  async searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]> {
    const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.post({
      ...this.baseFlightOfferParams,
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
        airline: airline,
        freeBaggage: this.hasFreeBaggage(offer),
        outbound: this.parseItinerary(offer.itineraries[0], fareDetailsMap),
      }
      : {
        price: parseFloat(offer.price.grandTotal),
        airline: airline,
        freeBaggage: this.hasFreeBaggage(offer),
        outbound: this.parseItinerary(offer.itineraries[0], fareDetailsMap),
        return: this.parseItinerary(offer.itineraries[1], fareDetailsMap),
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
  // TODO: Pull better data here from our local dataset
  private parseAirport(endpoint: AmadeusFlightEndPoint): Airport {
      return {
        iata: endpoint.iataCode,
        city: "PlaceholderCity",
        name: "PlaceholderName",
        country: "PlaceholderCountry",
      }
  }
  
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
        duration: this.parseISODuration(leg.duration),
        date: new Date(leg.departure.at),
        departureTime: new Date(leg.departure.at),
        arrivalTime: new Date(leg.arrival.at),
        ... currentSegmentFareDetails
      };
    });
  }
}