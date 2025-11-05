import SkyboundAPI, { Airline, Airport, Flight, FlightLeg, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from "@skyboundTypes/SkyboundAPI";
import * as dotenv from 'dotenv';
const Amadeus = require('amadeus');

const ENV_FILE = '/.env.amadeus.local';

// Represents a generic response from the Amadeus API
export interface AmadeusResponse {
  data: any;
  result?: any;
}

// Represents a "flight endpoint" (effectively an airport)
export interface AmadeusFlightEndPoint {
  iataCode: string;
}

// In theory contains various information about the fare
// Checked bags is what we care about
interface AmadeusFareDetail {
  includedCheckedBags?: {
    quantity?: number;
  };
}

interface AmadeusTravelerPricing {
  fareDetailsBySegment?: AmadeusFareDetail[];
}

// Represents a segment (or leg) of the flight
interface AmadeusSegment {
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

  // ISO 8601 string -> number of minutes
  private parseISODuration(duration: string): number {
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
  
  // Amadeus flight endpoint -> Skybound Airport
  private parseAirport(endpoint: AmadeusFlightEndPoint): Airport {
      return {
        iata: endpoint.iataCode,
        city: "PlaceholderCity",
        name: "PlaceholderName",
        country: "PlaceholderCountry",
      }
  }
  
  // Amadeus segment -> Skybound FlightLeg
  private parseLeg(leg: AmadeusSegment): FlightLeg {
    return {
      from: this.parseAirport(leg.departure),
      to: this.parseAirport(leg.arrival),
      duration: this.parseISODuration(leg.duration),
      date: new Date(leg.departure.at),
      departureTime: new Date(leg.departure.at),
      arrivalTime: new Date(leg.arrival.at),
    }
  }

  // Amadeus flight search response -> Skybound Flights[]
  private parseFlights(json: AmadeusResponse): Flight[] {
    if (!json) {
      throw new Error("Error parsing flights from Amadeus API response: no response json provided");
    }
    
    if (!Array.isArray(json.data)) {
      throw new Error("Error parsing flights from Amadeus API response: json.data is not an array");
    }

    // Maps IATA airline codes to human-friendly airline names
    const carriersDict: {[airlineCodeIATA: string]: string} = json.result.dictionaries.carriers;

    return json.data.map((offer: any): Flight => {
      if (offer.itineraries.length == 0) {
        throw new Error("No itinerary associated with offer in Amadeus response");
      }

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
        class: offer.TravelClass,
        freeBaggage: this.hasFreeBaggage(offer),
        outbound: offer.itineraries[0].segments.map((leg:any) => this.parseLeg(leg)),
      }
      : {
        price: parseFloat(offer.price.grandTotal),
        airline: airline,
        class: offer.TravelClass,
        freeBaggage: this.hasFreeBaggage(offer),
        outbound: offer.itineraries[0].segments.map((leg:any) => this.parseLeg(leg)),
        return: offer.itineraries[1].segments.map((leg:any) => this.parseLeg(leg)),
      };

      return flight;
    });
  }

  async searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]> {
    const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.originAirportIATA,
      destinationLocationCode: params.destinationAirportIATA,
      departureDate: this.toLocalISOString(new Date(params.startDate)),
      ...(params.flexibleDates ? // Optional 3 day window
        {dateTimeRange: { date: this.toLocalISOString(new Date(params.startDate)), dateWindow: 'P3D' }} : {}
      ),
      returnDate: this.toLocalISOString(new Date(params.endDate)),
      adults: 1,
      currencyCode: 'USD',
    });
    
    if (response == undefined) {
      throw new Error("Error in Amadeus backend: expected response from API, got undefined");
    }
    
    return this.parseFlights(response);
  }

  async searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]> {
    const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.originAirportIATA,
      destinationLocationCode: params.destinationAirportIATA,
      departureDate: this.toLocalISOString(new Date(params.date)),
      ...(params.flexibleDates ? // Optional 3 day window
        {dateTimeRange: { date: this.toLocalISOString(new Date(params.date)), dateWindow: 'P3D' }} : {}
      ),
      adults: 1,
      currencyCode: 'USD',
    });
    
    if (response == undefined) {
      throw new Error("Error in Amadeus backend: expected response from API, got undefined");
    }
    
    return this.parseFlights(response);
  }

  async searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]> {
    const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.post({
      sources: ["GDS"],
      travelers: [
        {
          id: "1",
          travelerType: "ADULT"
        }
      ],
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
    
    return this.parseFlights(response);
  }
}