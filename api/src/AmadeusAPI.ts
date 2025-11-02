import SkyboundAPI, { Flight, FlightLeg, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from "@skyboundTypes/SkyboundAPI";
import * as dotenv from 'dotenv';
const Amadeus = require('amadeus');

const ENV_FILE = '/.env.amadeus.local';

export interface AmadeusResponse {
  data: any;
}

export interface AmadeusFlightSegment {
  duration: string,
  departure: {
    iataCode: string,
    at: string,
  },
  arrival: {
    iataCode: string,
    at: string,
  },
}

export default class AmadeusAPI implements SkyboundAPI {
  private amadeus: typeof Amadeus | null = null;
  
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
  
  private parseSegment(segment: AmadeusFlightSegment): FlightLeg {
    return {
      from: segment.departure.iataCode,
      to: segment.arrival.iataCode,
      date: new Date(segment.departure.at),
      arrivalTime: new Date(segment.arrival.at),
      fromAirport: this.parseISODuration(segment.duration),
    }
  }

  private parseFlights(json: any): Flight[] {
    if (!json) {
      throw new Error("Error parsing flights from Amadeus API response: no response json provided");
    }
    
    if (!Array.isArray(json.data)) {
      throw new Error("Error parsing flights from Amadeus API response: json.data is not an array");
    }

    // Maps IATA airline codes to human-readable airline names
    const carriersDict: {[airlineCodeIATA: string]: string} = json.result.dictionaries.carriers;
    return json.data.map((offer: any): Flight => {
      const outboundSegment: FlightLeg = this.parseSegment(offer.itineraries[0].segments[0]);
      let returnSegment: FlightLeg | undefined = undefined;

      if (offer.itineraries.length > 1) {
        returnSegment = this.parseSegment(offer.itineraries[1].segments[0]);
      }

      const flight: Flight = {
        price: parseFloat(offer.price.grandTotal),
        airline: carriersDict[offer.validatingAirlineCodes[0]],
        outbound: outboundSegment,
        return: returnSegment,
      };

      return flight;
    });
  }

  async searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]> {
    const response: AmadeusResponse | undefined = await this.amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.originAirportIATA,
      destinationLocationCode: params.destinationAirportIATA,
      departureDate: this.toLocalISOString(new Date(params.startDate)),
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
      adults: 1,
      currencyCode: 'USD',
    });
    
    if (response == undefined) {
      throw new Error("Error in Amadeus backend: expected response from API, got undefined");
    }
    
    return this.parseFlights(response);
  }

  async searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]> {
    throw new Error("Multi flight search is not yet implemented");
  }
}