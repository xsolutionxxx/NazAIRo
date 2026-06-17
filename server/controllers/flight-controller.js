import flightService from "../service/flight-service.js";

class FlightController {
  async search(req, res, next) {
    try {
      const {
        from, to, date, returnDate,
        passengers, cabinClass,
        minPrice, maxPrice, airlines,
        maxDuration, departureTimeFrom, departureTimeTo,
        sortBy, sortOrder, page, limit,
      } = req.validatedQuery;

      const result = await flightService.searchFlights({
        from, to, date, returnDate,
        passengers, cabinClass,
        minPrice, maxPrice,
        airlines: airlines ? airlines.split(",") : undefined,
        maxDuration, departureTimeFrom, departureTimeTo,
        sortBy, sortOrder, page, limit,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getById(req, res, next) {
    try {
      const flight = await flightService.getFlightById(req.params.id);
      return res.json(flight);
    } catch (e) {
      next(e);
    }
  }

  async getBookedSeats(req, res, next) {
    try {
      const seats = await flightService.getBookedSeats(req.params.id);
      return res.json(seats);
    } catch (e) {
      next(e);
    }
  }

  async getAirports(req, res, next) {
    try {
      const airports = await flightService.getAirports(req.query.search);
      return res.json(airports);
    } catch (e) {
      next(e);
    }
  }

  async getAirlines(req, res, next) {
    try {
      const airlines = await flightService.getAirlines();
      return res.json(airlines);
    } catch (e) {
      next(e);
    }
  }

  // Admin
  async adminGetAll(req, res, next) {
    try {
      const result = await flightService.getAllFlightsAdmin(req.validatedQuery ?? req.query);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async adminCreate(req, res, next) {
    try {
      const flight = await flightService.createFlight(req.body);
      return res.status(201).json(flight);
    } catch (e) {
      next(e);
    }
  }

  async adminUpdate(req, res, next) {
    try {
      const flight = await flightService.updateFlight(req.params.id, req.body);
      return res.json(flight);
    } catch (e) {
      next(e);
    }
  }

  async adminDelete(req, res, next) {
    try {
      const result = await flightService.deleteFlight(req.params.id);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

export default new FlightController();
