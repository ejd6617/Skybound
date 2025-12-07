export type TripStatus =
  | 'Confirmed'
  | 'Delayed'
  | 'Boarding Soon'
  | 'Boarding'
  | 'In the Air'
  | 'Completed'
  | 'Canceled';

export interface LayoverInfo {
  id: string;
  airportName: string;
  airportCode: string;
  duration: string;
}

export interface TripCardData {
  id: string;
  dateRange: string;
  route: string;
  airline: string;
  travelerCount: number;
  status: TripStatus;
  upcoming: boolean;
  gate?: string;
  terminal?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  layovers?: LayoverInfo[];
  traveler: object,

}
