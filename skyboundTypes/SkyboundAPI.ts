export interface Params {};

export interface OneWayQueryParams extends Params {
  originAirportIATA: string, // 3 Letter IATA code
  destinationAirportIATA: string, // 3 Letter IATA code
  flexibleAirports: boolean, // Whether or not to search multiple nearby airports
  flexibleDates: boolean, // Whether or not to search +/- 3 days from specified
  date: Date, // Date of departure
}

export interface RoundTripQueryParams extends Params {
  originAirportIATA: string,
  destinationAirportIATA: string,
  flexibleAirports: boolean,
  flexibleDates: boolean,
  startDate: Date,
  endDate: Date,
}

export interface MultiCityQueryParams extends Params {
  flexibleAirports: boolean,
  flexibleDates: boolean,
  layovers: FlightLeg[],
}

// Represents the flight to/from destination, but not both
export interface FlightLeg {
  from: string, // Origin airport
  to: string, // Destination airport
  date: Date | null, // Specific time, not just a date
}

export interface Airline {
  iata: string,
  name: string,
}

export interface Airport {
  iata: string;
  city: string;
  name: string;
  country: string;
}

// Represents a full flight ticket, may be round trip
export interface Flight {
  price: number,
  airline: Airline,
  outbound: FlightLeg[],
  return?: FlightLeg[], // Optional, may not be set for one way flights
}

export default interface SkyboundAPI {
  searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]>;
  searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]>;
  searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]>;
}

