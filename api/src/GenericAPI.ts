export interface Params {};

export interface RoundTripQueryParams extends Params {
  originAirport: string, // 3 Letter IATA code
  destinationAirport: string, // 3 Letter IATA code
  startDate: Date, // Date of departure
  endDate: Date, // Date of return
}

export interface OneWayQueryParams extends Params {
  originAirport: string,
  destinationAirport: string,
  date: Date,
}

export interface MultiCityQueryParams extends Params {
  layovers: [
    {
      originAirport: string,
      destinationAirport: string,
      startDate: Date,
      endDate: Date,
    }
  ]
}

// Represents the flight to/from destination, but not both
export interface FlightSection {
  from: string, // Origin airport
  to: string, // Destination airport
  takeoff: Date, // Specific time, not just a date
  duration: number, // Duration of flight in minutes
}

// Represents a full flight ticket, may be round trip
export interface Flight {
  price: number,
  airline: string,
  outbound: FlightSection,
  return?: FlightSection, // Optional, may not be set for one way flights
}

export default interface GenericAPI {
  searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]>;
  searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]>;
  searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]>;
}

