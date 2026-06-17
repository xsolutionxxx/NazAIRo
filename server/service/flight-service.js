import prisma from "../shared/lib/prisma-db.js";
import ApiError from "../exceptions/api-error.js";

class FlightService {
  // Search flights with filters
  async searchFlights({
    from,
    to,
    date,
    returnDate,
    passengers = 1,
    cabinClass,
    minPrice,
    maxPrice,
    airlines,
    maxDuration,
    departureTimeFrom,
    departureTimeTo,
    sortBy = "price",
    sortOrder = "asc",
    page = 1,
    limit = 20,
  }) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
      departureAirport: { iata: from.toUpperCase() },
      arrivalAirport: { iata: to.toUpperCase() },
      departureTime: { gte: startOfDay, lte: endOfDay },
      availableSeats: { gte: Number(passengers) },
    };

    if (cabinClass) where.cabinClass = cabinClass;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (airlines?.length) {
      where.airline = { iata: { in: airlines } };
    }
    if (departureTimeFrom || departureTimeTo) {
      const fromHour = departureTimeFrom ? Number(departureTimeFrom) : 0;
      const toHour = departureTimeTo ? Number(departureTimeTo) : 23;
      const gte = new Date(date);
      gte.setHours(fromHour, 0, 0, 0);
      const lte = new Date(date);
      lte.setHours(toHour, 59, 59, 999);
      where.departureTime = { gte, lte };
    }

    const orderBy = this._buildOrderBy(sortBy, sortOrder);
    const skip = (Number(page) - 1) * Number(limit);

    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      }),
      prisma.flight.count({ where }),
    ]);

    // For round-trip: search return flights
    let returnFlights = null;
    if (returnDate) {
      const retStart = new Date(returnDate);
      retStart.setHours(0, 0, 0, 0);
      const retEnd = new Date(returnDate);
      retEnd.setHours(23, 59, 59, 999);

      returnFlights = await prisma.flight.findMany({
        where: {
          departureAirport: { iata: to.toUpperCase() },
          arrivalAirport: { iata: from.toUpperCase() },
          departureTime: { gte: retStart, lte: retEnd },
          availableSeats: { gte: Number(passengers) },
          ...(cabinClass ? { cabinClass } : {}),
        },
        orderBy,
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });
    }

    return {
      flights: flights.map(this._formatFlight),
      returnFlights: returnFlights?.map(this._formatFlight) ?? null,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getFlightById(id) {
    const flight = await prisma.flight.findUnique({
      where: { id },
      include: {
        airline: true,
        departureAirport: true,
        arrivalAirport: true,
      },
    });
    if (!flight) throw ApiError.NotFound("Flight not found");
    return this._formatFlight(flight);
  }

  async getAirports(search) {
    const where = search
      ? {
          OR: [
            { iata: { contains: search.toUpperCase() } },
            { city: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { country: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return prisma.airport.findMany({ where, take: 10, orderBy: { city: "asc" } });
  }

  async getAirlines() {
    return prisma.airline.findMany({ orderBy: { name: "asc" } });
  }

  // ─── Admin CRUD ────────────────────────────────────────────────────────────

  async createFlight(data) {
    const { airlineIata, departureIata, arrivalIata, ...rest } = data;

    const [airline, departureAirport, arrivalAirport] = await Promise.all([
      prisma.airline.findUnique({ where: { iata: airlineIata } }),
      prisma.airport.findUnique({ where: { iata: departureIata } }),
      prisma.airport.findUnique({ where: { iata: arrivalIata } }),
    ]);

    if (!airline) throw ApiError.NotFound("Airline not found");
    if (!departureAirport) throw ApiError.NotFound("Departure airport not found");
    if (!arrivalAirport) throw ApiError.NotFound("Arrival airport not found");

    return prisma.flight.create({
      data: {
        ...rest,
        airlineId: airline.id,
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
      },
      include: { airline: true, departureAirport: true, arrivalAirport: true },
    });
  }

  async updateFlight(id, data) {
    const flight = await prisma.flight.findUnique({ where: { id } });
    if (!flight) throw ApiError.NotFound("Flight not found");
    return prisma.flight.update({
      where: { id },
      data,
      include: { airline: true, departureAirport: true, arrivalAirport: true },
    });
  }

  async deleteFlight(id) {
    const flight = await prisma.flight.findUnique({ where: { id } });
    if (!flight) throw ApiError.NotFound("Flight not found");
    await prisma.flight.delete({ where: { id } });
    return { message: "Flight deleted" };
  }

  async getAllFlightsAdmin({ page = 1, limit = 20, search }) {
    const where = search
      ? {
          OR: [
            { flightNumber: { contains: search, mode: "insensitive" } },
            { departureAirport: { city: { contains: search, mode: "insensitive" } } },
            { arrivalAirport: { city: { contains: search, mode: "insensitive" } } },
            { airline: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { departureTime: "asc" },
        include: { airline: true, departureAirport: true, arrivalAirport: true },
      }),
      prisma.flight.count({ where }),
    ]);

    return { flights: flights.map(this._formatFlight), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _formatFlight(flight) {
    const durationMs = new Date(flight.arrivalTime) - new Date(flight.departureTime);
    const durationMin = Math.round(durationMs / 60000);

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      airline: {
        id: flight.airline.id,
        iata: flight.airline.iata,
        name: flight.airline.name,
        logoUrl: flight.airline.logoUrl,
      },
      departure: {
        airport: flight.departureAirport,
        time: flight.departureTime,
      },
      arrival: {
        airport: flight.arrivalAirport,
        time: flight.arrivalTime,
      },
      duration: {
        minutes: durationMin,
        formatted: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`,
      },
      price: Number(flight.price),
      cabinClass: flight.cabinClass,
      availableSeats: flight.availableSeats,
      totalSeats: flight.totalSeats,
      amenities: flight.amenities,
    };
  }

  async getBookedSeats(flightId) {
    const bookings = await prisma.flightBooking.findMany({
      where: {
        flightId,
        booking: { status: { in: ["CONFIRMED", "PENDING"] } },
      },
      include: { passengers: { select: { seatNumber: true } } },
    });
    return bookings
      .flatMap((b) => b.passengers.map((p) => p.seatNumber))
      .filter(Boolean);
  }

  _buildOrderBy(sortBy, sortOrder) {
    const order = sortOrder === "desc" ? "desc" : "asc";
    switch (sortBy) {
      case "price":       return { price: order };
      case "duration":    return { departureTime: order };
      case "departure":   return { departureTime: order };
      case "arrival":     return { arrivalTime: order };
      default:            return { price: "asc" };
    }
  }
}

export default new FlightService();
