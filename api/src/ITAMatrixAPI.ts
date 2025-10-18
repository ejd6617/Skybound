import GenericAPI, { MultiCityQueryParams, OneWayQueryParams, RoundTripQueryParams, SkyboundFlight } from "@/GenericAPI";
import { runQuery } from "@/ITAMatrixBackend";

export default class ITAMatrixAPI implements GenericAPI {
  async searchFlightsRoundTrip(params: RoundTripQueryParams): Promise<SkyboundFlight[]> {
    return await runQuery("roundTrip", {
      originAirport: params.originAirport,
      destinationAirport: params.destinationAirport,
      startDate: params.startDate,
      endDate: params.endDate,
    });
  }
  async searchFlightsOneWay(params: OneWayQueryParams): Promise<SkyboundFlight[]> {
    return await runQuery("oneWay", {
      originAirport: params.originAirport,
      destinationAirport: params.destinationAirport,
      date: params.date,
    });
  }
  async searchFlightsMultiCity(params: MultiCityQueryParams): Promise<SkyboundFlight[]> {
    // TODO: Implement
    return await runQuery("multiCity", {});
  }
}