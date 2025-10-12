import GenericAPI, { Flight, FlightSection, MultiCityQueryParams, OneWayQueryParams, Params, RoundTripQueryParams } from "@/src/GenericAPI";
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import * as dotenv from 'dotenv';

const ENV_FILE = '/.env.amadeus.local';

// Structure of responses from amadeus containing an access token
export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

export default class AmadeusAPI implements GenericAPI {
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;
  
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

  private parseFlights(json: any): Flight[] {
    if (!json || !Array.isArray(json.data)) return [];

    // Maps IATA airline codes to human-readable airline names
    const carriersDict: {[airlineCodeIATA: string]: string} = json.dictionaries.carriers;
    return json.data.map((offer: any): Flight => {
      const outboundItinerary = offer.itineraries[0];
      const outboundSegment = outboundItinerary.segments[0];
      const outboundSection: FlightSection = {
        from: outboundSegment.departure.iataCode,
        to: outboundSegment.arrival.iataCode,
        takeoff: new Date(outboundSegment.departure.at),
        duration: this.parseISODuration(outboundSegment.duration),
      };

      let returnSection: FlightSection | undefined = undefined;

      if (offer.itineraries.length > 1) {
        const returnSegment = offer.itineraries[1].segments[0];
        returnSection = {
          from: returnSegment.departure.iataCode,
          to: returnSegment.arrival.iataCode,
          takeoff: new Date(returnSegment.departure.at),
          duration: this.parseISODuration(returnSegment.duration),
        };
      }

      const flight: Flight = {
        price: parseFloat(offer.price.grandTotal),
        airline: carriersDict[offer.validatingAirlineCodes[0]],
        outbound: outboundSection,
        return: returnSection,
      };

      return flight;
    });
  }

  // Function to get the access token from Amadeus API
  private async getAccessToken(): Promise<string | null>  {
    const now = Date.now();
    
      // Reuse token if not expired
    if (this.cachedToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.cachedToken;
    }

    dotenv.config({ path: ENV_FILE });

    const AMADEUS_KEY = process.env.AMADEUS_KEY;
    if (!AMADEUS_KEY) {
      throw new Error(`AMADEUS_KEY is not set in ${ENV_FILE}`);
    }

    const AMADEUS_SECRET = process.env.AMADEUS_SECRET;
    if (!AMADEUS_SECRET) {
      throw new Error(`AMADEUS_SECRET is not set in ${ENV_FILE}`);
    }

    const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    const data = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AMADEUS_KEY,
      client_secret: AMADEUS_SECRET,
    });
    
    try {
      const response: AxiosResponse<AccessTokenResponse> = await axios.post(url, data);
      const { access_token, expires_in } = response.data;
      this.cachedToken = access_token;
      this.tokenExpiry = now + ((expires_in-5) * 1000)

      return response.data.access_token;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return null;
    }

  }
  
  private async runQuery(endpoint: string, params: Params) {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return;

    const url = `https://test.api.amadeus.com/v2/${endpoint}`;

    try {
      console.log(`Querying Amadeus at url ${url} with the following parameters:`)
      console.log(params);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: params,
      });

      return this.parseFlights(response.data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }

  }
  
  async searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]> {
    const flights: Flight[] | undefined =  await this.runQuery("shopping/flight-offers", {
      originLocationCode: params.originAirport,
      destinationLocationCode: params.destinationAirport,
      departureDate: this.toLocalISOString(new Date(params.startDate)),
      returnDate: this.toLocalISOString(new Date(params.endDate)),
      adults: 1,
      currencyCode: 'USD',
    });
    
    if (flights == undefined) {
      throw new Error("Error in Amadeus backend: expected list of flights, got undefined");
    }

    return flights;
  }

  async searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]> {
    const flights: Flight[] | undefined = await this.runQuery("shopping/flight-offers", {
      originLocationCode: params.originAirport,
      destinationLocationCode: params.destinationAirport,
      departureDate: this.toLocalISOString(new Date(params.date)),
      adults: 1,
      currencyCode: 'USD',
    });
    
    if (flights == undefined) {
      throw new Error("Error in Amadeus backend: expected list of flights, got undefined");
    }

    return flights;
  }

  async searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]> {
    throw new Error("Multi flight search is not yet implemented");
  }
}