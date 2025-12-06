export interface Params {};

export interface FlightDealsParams extends Params {
  originAirportIATA: string,
}


export interface OneWayQueryParams extends Params {
  originAirportIATA: string, // 3 Letter IATA code
  destinationAirportIATA: string, // 3 Letter IATA code
  flexibleAirports: string[], // List of IATA codes for nearby airports to search from
  flexibleDates: boolean, // Whether or not to search +/- 3 days from specified
  date: Date, // Date of departure
  travelers: Traveler[]
  currencyCode: string,
}

export interface RoundTripQueryParams extends Params {
  originAirportIATA: string,
  destinationAirportIATA: string,
  flexibleAirports: string[],
  flexibleDates: boolean,
  startDate: Date,
  endDate: Date,
  travelers: Traveler[]
  currencyCode: string,
}

export interface QueryLeg {
  originAirportIATA: string,
  destinationAirportIATA: string,
  date: Date,
}

export interface MultiCityQueryParams extends Params {
  flexibleDates: boolean,
  legs: QueryLeg[],
  travelers: Traveler[]
  currencyCode: string,
}

export type TravelClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

// Represents the flight to/from destination, but not both
export interface FlightLeg {
  from: Airport, // Origin airport
  to: Airport, // Destination airport
  date: Date, // Specific time, not just a date
  departureTime: Date,
  arrivalTime: Date,
  duration: number, // In minutes
  travelClass: TravelClass,
  // terminal: string,
  // flightNumber: string,
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

export type TravelerType = "ADULT" | "CHILD" | "SENIOR" | "YOUNG" | "STUDENT";

export interface Traveler {
  travelerType: TravelerType,
  dateOfBirth: Date, 
  nationality: string, // 2 letter country code
}

// Represents a full flight ticket, may be round trip
export interface Flight {
  price: number,
  currencyCode: string,
  travelers: Traveler[],
  airline: Airline,
  outbound: FlightLeg[],
  return?: FlightLeg[], // Optional, may not be set for one way flights
  freeBaggage: boolean,
}

export default interface SkyboundAPI {
  searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]>;
  searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]>;
  searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]>;
  getFlightDeals(params: FlightDealsParams): Promise<Flight[]>;
}

