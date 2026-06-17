import prisma from "../shared/lib/prisma-db.js";
import ApiError from "../exceptions/api-error.js";

class HotelService {
  async searchHotels({ city, checkIn, checkOut, guests = 1, stars, minPrice, maxPrice, sortBy = "rating", sortOrder = "desc", page = 1, limit = 12 }) {
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) throw ApiError.BadRequest("Check-out must be after check-in");

    const hotelWhere = city ? { city: { contains: city, mode: "insensitive" } } : {};
    if (stars) hotelWhere.stars = { gte: Number(stars) };

    const skip = (Number(page) - 1) * Number(limit);

    // Find hotels that have at least one available room fitting the criteria
    const roomWhere = {
      isAvailable: true,
      capacity: { gte: Number(guests) },
    };
    if (minPrice || maxPrice) {
      roomWhere.pricePerNight = {};
      if (minPrice) roomWhere.pricePerNight.gte = Number(minPrice);
      if (maxPrice) roomWhere.pricePerNight.lte = Number(maxPrice);
    }

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where: {
          ...hotelWhere,
          rooms: { some: roomWhere },
        },
        skip,
        take: Number(limit),
        orderBy: this._buildOrderBy(sortBy, sortOrder),
        include: {
          rooms: {
            where: roomWhere,
            orderBy: { pricePerNight: "asc" },
            take: 1,
          },
        },
      }),
      prisma.hotel.count({
        where: { ...hotelWhere, rooms: { some: roomWhere } },
      }),
    ]);

    return {
      hotels: hotels.map((h) => this._formatHotel(h, nights)),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      nights,
    };
  }

  async getHotelById(id, { checkIn, checkOut, guests = 1 } = {}) {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: { rooms: { orderBy: { pricePerNight: "asc" } } },
    });
    if (!hotel) throw ApiError.NotFound("Hotel not found");

    let nights = 1;
    if (checkIn && checkOut) {
      nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    }

    // Normalize Decimal fields
    const normalizedHotel = { ...hotel, rating: Number(hotel.rating) };

    const roomsWithAvailability = await Promise.all(
      normalizedHotel.rooms.map(async (room) => {
        let isAvailableForDates = room.isAvailable;
        if (checkIn && checkOut && isAvailableForDates) {
          const conflict = await prisma.hotelBooking.findFirst({
            where: {
              roomId: room.id,
              booking: { status: "CONFIRMED" },
              AND: [
                { checkIn:  { lt: new Date(checkOut) } },
                { checkOut: { gt: new Date(checkIn)  } },
              ],
            },
          });
          isAvailableForDates = !conflict;
        }
        return { ...room, pricePerNight: Number(room.pricePerNight), isAvailableForDates, totalPrice: Number(room.pricePerNight) * nights };
      }),
    );

    return { ...normalizedHotel, rooms: roomsWithAvailability, nights };
  }

  async getCities(search) {
    const where = search
      ? { city: { contains: search, mode: "insensitive" } }
      : {};

    const cities = await prisma.hotel.findMany({
      where,
      select: { city: true, country: true },
      distinct: ["city"],
      take: 10,
      orderBy: { city: "asc" },
    });

    return cities;
  }

  // ─── Admin CRUD ────────────────────────────────────────────────────────────

  async createHotel(data) {
    return prisma.hotel.create({ data, include: { rooms: true } });
  }

  async updateHotel(id, data) {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw ApiError.NotFound("Hotel not found");
    return prisma.hotel.update({ where: { id }, data, include: { rooms: true } });
  }

  async deleteHotel(id) {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw ApiError.NotFound("Hotel not found");
    await prisma.hotel.delete({ where: { id } });
    return { message: "Hotel deleted" };
  }

  async getAllHotelsAdmin({ page = 1, limit = 20, search }) {
    const where = search
      ? {
          OR: [
            { name:    { contains: search, mode: "insensitive" } },
            { city:    { contains: search, mode: "insensitive" } },
            { country: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({ where, skip, take: Number(limit), orderBy: { name: "asc" }, include: { rooms: true } }),
      prisma.hotel.count({ where }),
    ]);
    return { hotels, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _formatHotel(hotel, nights = 1) {
    const cheapestRoom = hotel.rooms?.[0];
    return {
      id:          hotel.id,
      name:        hotel.name,
      description: hotel.description,
      city:        hotel.city,
      country:     hotel.country,
      address:     hotel.address,
      rating:      Number(hotel.rating),
      stars:       hotel.stars,
      imageUrls:   hotel.imageUrls,
      amenities:   hotel.amenities,
      latitude:    hotel.latitude  ? Number(hotel.latitude)  : null,
      longitude:   hotel.longitude ? Number(hotel.longitude) : null,
      pricePerNight:    cheapestRoom ? Number(cheapestRoom.pricePerNight) : null,
      totalPrice:       cheapestRoom ? Number(cheapestRoom.pricePerNight) * nights : null,
      availableRooms:   hotel.rooms?.length ?? 0,
      nights,
    };
  }

  _buildOrderBy(sortBy, sortOrder) {
    const order = sortOrder === "asc" ? "asc" : "desc";
    switch (sortBy) {
      case "price":  return { rooms: { _count: order } };
      case "stars":  return { stars: order };
      case "rating": return { rating: order };
      case "name":   return { name: "asc" };
      default:       return { rating: "desc" };
    }
  }
}

export default new HotelService();
