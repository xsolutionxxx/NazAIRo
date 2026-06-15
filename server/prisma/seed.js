import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function randomSeats(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const airlines = [
  { iata: "PS", name: "Ukraine International Airlines", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ukraine_International_Airlines_logo.svg/320px-Ukraine_International_Airlines_logo.svg.png" },
  { iata: "LH", name: "Lufthansa", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Lufthansa_logo_2018.svg/320px-Lufthansa_logo_2018.svg.png" },
  { iata: "FR", name: "Ryanair", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ryanair.svg/320px-Ryanair.svg.png" },
  { iata: "W6", name: "Wizz Air", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Wizz_Air_logo.svg/320px-Wizz_Air_logo.svg.png" },
  { iata: "TK", name: "Turkish Airlines", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Turkish_Airlines_logo_2019_compact.svg/320px-Turkish_Airlines_logo_2019_compact.svg.png" },
  { iata: "BA", name: "British Airways", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/British_Airways_Logo.svg/320px-British_Airways_Logo.svg.png" },
];

const airports = [
  { iata: "KBP", name: "Boryspil International Airport", city: "Kyiv", country: "Ukraine", timezone: "Europe/Kyiv" },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", timezone: "Europe/Berlin" },
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", timezone: "Europe/London" },
  { iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", timezone: "Europe/Paris" },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul" },
  { iata: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", timezone: "Europe/Warsaw" },
  { iata: "BCN", name: "Barcelona El Prat Airport", city: "Barcelona", country: "Spain", timezone: "Europe/Madrid" },
  { iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
  { iata: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", timezone: "Europe/Vienna" },
  { iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", timezone: "Asia/Dubai" },
];

// Generate flights for the next 30 days
function buildFlights(airlineMap, airportMap) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);

  const routes = [
    // From Kyiv
    { from: "KBP", to: "FRA", airline: "PS", duration: 3.0, price: 189, number: "PS101" },
    { from: "KBP", to: "FRA", airline: "LH", duration: 3.0, price: 210, number: "LH1452" },
    { from: "KBP", to: "LHR", airline: "PS", duration: 3.5, price: 220, number: "PS201" },
    { from: "KBP", to: "CDG", airline: "PS", duration: 3.2, price: 195, number: "PS301" },
    { from: "KBP", to: "IST", airline: "TK", duration: 2.5, price: 150, number: "TK401" },
    { from: "KBP", to: "WAW", airline: "PS", duration: 1.5, price: 89,  number: "PS501" },
    { from: "KBP", to: "WAW", airline: "W6", duration: 1.5, price: 69,  number: "W6501" },
    { from: "KBP", to: "BCN", airline: "W6", duration: 4.0, price: 175, number: "W6601" },
    { from: "KBP", to: "VIE", airline: "PS", duration: 2.0, price: 130, number: "PS701" },
    // From Frankfurt
    { from: "FRA", to: "KBP", airline: "LH", duration: 3.0, price: 215, number: "LH1453" },
    { from: "FRA", to: "LHR", airline: "LH", duration: 2.0, price: 180, number: "LH900"  },
    { from: "FRA", to: "DXB", airline: "LH", duration: 6.5, price: 450, number: "LH630"  },
    { from: "FRA", to: "IST", airline: "TK", duration: 3.5, price: 280, number: "TK1680" },
    // From London
    { from: "LHR", to: "KBP", airline: "BA", duration: 3.5, price: 230, number: "BA891"  },
    { from: "LHR", to: "FRA", airline: "BA", duration: 2.0, price: 175, number: "BA902"  },
    { from: "LHR", to: "CDG", airline: "BA", duration: 1.3, price: 120, number: "BA304"  },
    { from: "LHR", to: "BCN", airline: "BA", duration: 2.5, price: 160, number: "BA476"  },
    { from: "LHR", to: "DXB", airline: "BA", duration: 7.0, price: 520, number: "BA107"  },
    // From Istanbul
    { from: "IST", to: "KBP", airline: "TK", duration: 2.5, price: 155, number: "TK402"  },
    { from: "IST", to: "FRA", airline: "TK", duration: 3.5, price: 270, number: "TK1681" },
    { from: "IST", to: "DXB", airline: "TK", duration: 4.0, price: 320, number: "TK760"  },
    // Budget routes
    { from: "WAW", to: "KBP", airline: "W6", duration: 1.5, price: 65,  number: "W6502"  },
    { from: "WAW", to: "LHR", airline: "FR", duration: 2.5, price: 89,  number: "FR8421" },
    { from: "BCN", to: "LHR", airline: "FR", duration: 2.5, price: 75,  number: "FR8422" },
    { from: "AMS", to: "LHR", airline: "FR", duration: 1.2, price: 55,  number: "FR8500" },
    { from: "AMS", to: "BCN", airline: "FR", duration: 2.8, price: 80,  number: "FR8501" },
  ];

  const departureTimes = [6, 9, 12, 15, 18, 21]; // hours
  const flights = [];

  for (let day = 0; day < 30; day++) {
    for (const route of routes) {
      // Not every route flies every day — pick 2-4 times per day randomly
      const times = departureTimes
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 2) + 2);

      for (const hour of times) {
        const departure = addDays(new Date(base), day);
        departure.setHours(hour, Math.floor(Math.random() * 4) * 15, 0, 0);
        const arrival = addHours(departure, route.duration);

        // Price varies by day and time
        const priceVariance = 1 + (day < 7 ? 0.15 : day < 14 ? 0 : -0.1) + (hour < 8 || hour > 19 ? -0.05 : 0);
        const finalPrice = Math.round(route.price * priceVariance);

        flights.push({
          flightNumber: route.number,
          airlineId: airlineMap[route.airline],
          departureAirportId: airportMap[route.from],
          arrivalAirportId: airportMap[route.to],
          departureTime: departure,
          arrivalTime: arrival,
          price: finalPrice,
          cabinClass: "ECONOMY",
          availableSeats: randomSeats(15, 120),
          totalSeats: 180,
          amenities: ["Wi-Fi", "Meal included", "USB charging"].slice(0, Math.floor(Math.random() * 3) + 1),
        });

        // Add a Business class variant for some routes
        if (route.price > 150 && Math.random() > 0.5) {
          flights.push({
            flightNumber: route.number + "B",
            airlineId: airlineMap[route.airline],
            departureAirportId: airportMap[route.from],
            arrivalAirportId: airportMap[route.to],
            departureTime: departure,
            arrivalTime: arrival,
            price: Math.round(finalPrice * 2.8),
            cabinClass: "BUSINESS",
            availableSeats: randomSeats(2, 20),
            totalSeats: 24,
            amenities: ["Wi-Fi", "Meal included", "USB charging", "Extra legroom", "Priority boarding", "Lounge access"],
          });
        }
      }
    }
  }

  return flights;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.passenger.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.flightBooking.deleteMany();
  await prisma.hotelBooking.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.airport.deleteMany();
  console.log("  ✓ Cleared existing data");

  // Seed airlines
  const createdAirlines = await Promise.all(
    airlines.map((a) => prisma.airline.create({ data: a }))
  );
  const airlineMap = Object.fromEntries(createdAirlines.map((a) => [a.iata, a.id]));
  console.log(`  ✓ Created ${createdAirlines.length} airlines`);

  // Seed airports
  const createdAirports = await Promise.all(
    airports.map((a) => prisma.airport.create({ data: a }))
  );
  const airportMap = Object.fromEntries(createdAirports.map((a) => [a.iata, a.id]));
  console.log(`  ✓ Created ${createdAirports.length} airports`);

  // Seed flights
  const flightData = buildFlights(airlineMap, airportMap);
  await prisma.flight.createMany({ data: flightData });
  console.log(`  ✓ Created ${flightData.length} flights`);

  // Seed hotels
  const hotelsData = [
    {
      name: "Fairmont Grand Hotel Kyiv",
      description: "5-star luxury hotel in the heart of Kyiv with stunning views of the Dnipro river.",
      city: "Kyiv",
      country: "Ukraine",
      address: "Naberezhno-Khreshchatytska St, 1, Kyiv",
      rating: 4.8,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      ],
      amenities: ["Pool", "Spa", "Restaurant", "Bar", "Gym", "Free WiFi", "Concierge", "Room Service"],
      latitude: 50.4501,
      longitude: 30.5234,
    },
    {
      name: "Hilton Frankfurt City Centre",
      description: "Modern hotel in central Frankfurt, ideal for business and leisure travelers.",
      city: "Frankfurt",
      country: "Germany",
      address: "Hochstraße 4, 60313 Frankfurt",
      rating: 4.5,
      stars: 4,
      imageUrls: [
        "https://images.unsplash.com/photo-1551882547-ff40c4a49f4e?w=800",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
      ],
      amenities: ["Restaurant", "Bar", "Gym", "Free WiFi", "Business Center", "Room Service"],
      latitude: 50.1109,
      longitude: 8.6821,
    },
    {
      name: "The Ritz London",
      description: "Iconic luxury hotel in Piccadilly, London. A symbol of British elegance since 1906.",
      city: "London",
      country: "United Kingdom",
      address: "150 Piccadilly, London W1J 9BR",
      rating: 4.9,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      ],
      amenities: ["Spa", "Restaurant", "Bar", "Gym", "Free WiFi", "Concierge", "Butler Service", "Afternoon Tea"],
      latitude: 51.5074,
      longitude: -0.1422,
    },
    {
      name: "Hotel Sofitel Paris Le Faubourg",
      description: "Refined luxury in the heart of Paris, steps from Place de la Concorde.",
      city: "Paris",
      country: "France",
      address: "15 Rue Boissy d'Anglas, 75008 Paris",
      rating: 4.7,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1601565415267-724db0a8b7fe?w=800",
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
      ],
      amenities: ["Spa", "Restaurant", "Bar", "Free WiFi", "Concierge", "Room Service", "Valet Parking"],
      latitude: 48.8698,
      longitude: 2.3232,
    },
    {
      name: "Marriott Istanbul Asia",
      description: "Contemporary hotel on the Asian side of Istanbul with Bosphorus views.",
      city: "Istanbul",
      country: "Turkey",
      address: "Hünkar İskelesi Cd. No:1, 34726 Istanbul",
      rating: 4.6,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
      ],
      amenities: ["Pool", "Spa", "Restaurant", "Bar", "Gym", "Free WiFi", "Bosphorus View"],
      latitude: 40.9927,
      longitude: 29.0277,
    },
    {
      name: "Radisson Blu Centrum Hotel Warsaw",
      description: "Centrally located in Warsaw, perfect base for business and exploring the city.",
      city: "Warsaw",
      country: "Poland",
      address: "Grzybowska 24, 00-132 Warsaw",
      rating: 4.4,
      stars: 4,
      imageUrls: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      ],
      amenities: ["Restaurant", "Bar", "Gym", "Free WiFi", "Business Center", "Sauna"],
      latitude: 52.2297,
      longitude: 20.9976,
    },
    {
      name: "W Barcelona",
      description: "Iconic sail-shaped hotel on Barceloneta beach with breathtaking sea views.",
      city: "Barcelona",
      country: "Spain",
      address: "Pl. de la Rosa dels Vents, 1, 08039 Barcelona",
      rating: 4.7,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
      ],
      amenities: ["Pool", "Spa", "Restaurant", "Bar", "Gym", "Beach Access", "Free WiFi", "Rooftop Bar"],
      latitude: 41.3748,
      longitude: 2.1896,
    },
    {
      name: "Waldorf Astoria Amsterdam",
      description: "Six interconnected 17th-century canal houses transformed into a world-class hotel.",
      city: "Amsterdam",
      country: "Netherlands",
      address: "Herengracht 542-556, 1017 CG Amsterdam",
      rating: 4.8,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
      ],
      amenities: ["Spa", "Restaurant", "Bar", "Free WiFi", "Concierge", "Canal Views", "Butler Service"],
      latitude: 52.3614,
      longitude: 4.8979,
    },
    {
      name: "Park Hyatt Vienna",
      description: "Grand hotel in a meticulously restored 1915 bank building in Vienna's first district.",
      city: "Vienna",
      country: "Austria",
      address: "Am Hof 2, 1010 Wien",
      rating: 4.9,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
      ],
      amenities: ["Pool", "Spa", "Restaurant", "Bar", "Gym", "Free WiFi", "Concierge", "Wine Cellar"],
      latitude: 48.2133,
      longitude: 16.3639,
    },
    {
      name: "Atlantis The Palm Dubai",
      description: "Iconic resort on Palm Jumeirah with a waterpark, private beach and world-class dining.",
      city: "Dubai",
      country: "UAE",
      address: "Crescent Rd, The Palm Jumeirah, Dubai",
      rating: 4.6,
      stars: 5,
      imageUrls: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
      ],
      amenities: ["Waterpark", "Private Beach", "Pool", "Spa", "Multiple Restaurants", "Bar", "Free WiFi", "Aquarium"],
      latitude: 25.1304,
      longitude: 55.1171,
    },
  ];

  const roomTypes = [
    { type: "Standard Room",  multiplier: 1.0, capacity: 2 },
    { type: "Deluxe Room",    multiplier: 1.4, capacity: 2 },
    { type: "Junior Suite",   multiplier: 1.9, capacity: 2 },
    { type: "Suite",          multiplier: 2.8, capacity: 4 },
  ];

  const basePrices = {
    5: 180,
    4: 120,
    3: 80,
  };

  for (const hotelData of hotelsData) {
    const hotel = await prisma.hotel.create({ data: hotelData });

    const basePrice = basePrices[hotelData.stars] || 100;
    const rooms = [];

    roomTypes.forEach((rt, typeIndex) => {
      const count = typeIndex === 3 ? 3 : 8; // Fewer suites
      for (let i = 1; i <= count; i++) {
        const roomNum = `${typeIndex + 1}0${String(i).padStart(2, "0")}`;
        rooms.push({
          hotelId: hotel.id,
          roomNumber: roomNum,
          type: rt.type,
          description: `${rt.type} with modern amenities and city views.`,
          pricePerNight: Math.round(basePrice * rt.multiplier),
          capacity: rt.capacity,
          amenities: ["Air conditioning", "Flat-screen TV", "Mini bar", "Safe", "Free WiFi"].slice(0, Math.floor(Math.random() * 3) + 3),
          imageUrls: hotelData.imageUrls.slice(0, 1),
          isAvailable: true,
        });
      }
    });

    await prisma.room.createMany({ data: rooms });
  }

  console.log(`  ✓ Created ${hotelsData.length} hotels with rooms`);
  console.log("\n✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
