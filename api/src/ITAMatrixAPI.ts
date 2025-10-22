import { runQuery } from "@/ITAMatrixBackend";
import SkyboundAPI, { Flight, MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams } from "@/SkyboundAPI";

export default class ITAMatrixAPI implements SkyboundAPI {
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