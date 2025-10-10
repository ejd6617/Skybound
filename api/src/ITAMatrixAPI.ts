import GenericAPI, { Flight, RoundTripQueryParams, OneWayQueryParams, MultiCityQueryParams } from "@src/GenericAPI"
import { runQuery } from "@src/Webscrape";

export default class ITAMatrixAPI implements GenericAPI {
  async searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<Flight[]> {
    return await runQuery("roundTrip", {
      originAirport: params.originAirport,
      destinationAirport: params.destinationAirport,
      startDate: params.startDate,
      endDate: params.endDate,
    });
  }
  async searchFlightsOneWay(params: OneWayQueryParams): Promise<Flight[]> {
    return await runQuery("oneWay", {
      originAirport: params.originAirport,
      destinationAirport: params.destinationAirport,
      date: params.date,
    });
  }
  async searchFlightsMultiCity(params: MultiCityQueryParams): Promise<Flight[]> {
    // TODO: Implement
    return await runQuery("multiCity", {});
  }
}