import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const addHours = (d, h) => new Date(d.getTime() + h * 3600000);
const addDays  = (d, n) => new Date(d.getTime() + n * 86400000);
const rand     = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick     = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Airlines ─────────────────────────────────────────────────────────────────

const airlines = [
  { iata:"PS", name:"Ukraine International Airlines",  logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ukraine_International_Airlines_logo.svg/320px-Ukraine_International_Airlines_logo.svg.png" },
  { iata:"LH", name:"Lufthansa",                       logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Lufthansa_logo_2018.svg/320px-Lufthansa_logo_2018.svg.png" },
  { iata:"FR", name:"Ryanair",                         logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ryanair.svg/320px-Ryanair.svg.png" },
  { iata:"W6", name:"Wizz Air",                        logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Wizz_Air_logo.svg/320px-Wizz_Air_logo.svg.png" },
  { iata:"TK", name:"Turkish Airlines",                logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Turkish_Airlines_logo_2019_compact.svg/320px-Turkish_Airlines_logo_2019_compact.svg.png" },
  { iata:"BA", name:"British Airways",                 logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/British_Airways_Logo.svg/320px-British_Airways_Logo.svg.png" },
  { iata:"EK", name:"Emirates",                        logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/320px-Emirates_logo.svg.png" },
  { iata:"AF", name:"Air France",                      logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/320px-Air_France_Logo.svg.png" },
  { iata:"KL", name:"KLM Royal Dutch Airlines",        logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/KLM_logo.svg/320px-KLM_logo.svg.png" },
  { iata:"LX", name:"Swiss International Air Lines",   logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Swiss_International_Air_Lines_Logo_2011.svg/320px-Swiss_International_Air_Lines_Logo_2011.svg.png" },
  { iata:"OS", name:"Austrian Airlines",               logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Austrian_Airlines_Logo.svg/320px-Austrian_Airlines_Logo.svg.png" },
  { iata:"IB", name:"Iberia",                          logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Iberia_Airlines_Logo.svg/320px-Iberia_Airlines_Logo.svg.png" },
  { iata:"AZ", name:"ITA Airways",                     logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/ITA_Airways_logo.svg/320px-ITA_Airways_logo.svg.png" },
  { iata:"SK", name:"Scandinavian Airlines",           logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SAS_logo.svg/320px-SAS_logo.svg.png" },
  { iata:"QR", name:"Qatar Airways",                   logoUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Qatar_Airways_Logo.svg/320px-Qatar_Airways_Logo.svg.png" },
];

// ─── Airports ─────────────────────────────────────────────────────────────────

const airports = [
  { iata:"KBP", name:"Boryspil International Airport",      city:"Kyiv",       country:"Ukraine",        timezone:"Europe/Kyiv"       },
  { iata:"FRA", name:"Frankfurt Airport",                    city:"Frankfurt",  country:"Germany",        timezone:"Europe/Berlin"     },
  { iata:"LHR", name:"Heathrow Airport",                     city:"London",     country:"United Kingdom", timezone:"Europe/London"     },
  { iata:"CDG", name:"Charles de Gaulle Airport",            city:"Paris",      country:"France",         timezone:"Europe/Paris"      },
  { iata:"IST", name:"Istanbul Airport",                     city:"Istanbul",   country:"Turkey",         timezone:"Europe/Istanbul"   },
  { iata:"WAW", name:"Warsaw Chopin Airport",                city:"Warsaw",     country:"Poland",         timezone:"Europe/Warsaw"     },
  { iata:"BCN", name:"Barcelona El Prat Airport",            city:"Barcelona",  country:"Spain",          timezone:"Europe/Madrid"     },
  { iata:"AMS", name:"Amsterdam Airport Schiphol",           city:"Amsterdam",  country:"Netherlands",    timezone:"Europe/Amsterdam"  },
  { iata:"VIE", name:"Vienna International Airport",         city:"Vienna",     country:"Austria",        timezone:"Europe/Vienna"     },
  { iata:"DXB", name:"Dubai International Airport",          city:"Dubai",      country:"UAE",            timezone:"Asia/Dubai"        },
  { iata:"MUC", name:"Munich Airport",                       city:"Munich",     country:"Germany",        timezone:"Europe/Berlin"     },
  { iata:"MAD", name:"Adolfo Suárez Madrid–Barajas Airport", city:"Madrid",     country:"Spain",          timezone:"Europe/Madrid"     },
  { iata:"FCO", name:"Leonardo da Vinci–Fiumicino Airport",  city:"Rome",       country:"Italy",          timezone:"Europe/Rome"       },
  { iata:"ZRH", name:"Zurich Airport",                       city:"Zurich",     country:"Switzerland",    timezone:"Europe/Zurich"     },
  { iata:"CPH", name:"Copenhagen Airport",                   city:"Copenhagen", country:"Denmark",        timezone:"Europe/Copenhagen" },
  { iata:"ATH", name:"Athens International Airport",         city:"Athens",     country:"Greece",         timezone:"Europe/Athens"     },
  { iata:"PRG", name:"Václav Havel Airport Prague",          city:"Prague",     country:"Czech Republic", timezone:"Europe/Prague"     },
  { iata:"BUD", name:"Budapest Ferenc Liszt Airport",        city:"Budapest",   country:"Hungary",        timezone:"Europe/Budapest"   },
  { iata:"LIS", name:"Lisbon Humberto Delgado Airport",      city:"Lisbon",     country:"Portugal",       timezone:"Europe/Lisbon"     },
  { iata:"DUB", name:"Dublin Airport",                       city:"Dublin",     country:"Ireland",        timezone:"Europe/Dublin"     },
  { iata:"MXP", name:"Milan Malpensa Airport",               city:"Milan",      country:"Italy",          timezone:"Europe/Rome"       },
  { iata:"GVA", name:"Geneva Airport",                       city:"Geneva",     country:"Switzerland",    timezone:"Europe/Zurich"     },
  { iata:"BRU", name:"Brussels Airport",                     city:"Brussels",   country:"Belgium",        timezone:"Europe/Brussels"   },
  { iata:"ARN", name:"Stockholm Arlanda Airport",            city:"Stockholm",  country:"Sweden",         timezone:"Europe/Stockholm"  },
  { iata:"DOH", name:"Hamad International Airport",          city:"Doha",       country:"Qatar",          timezone:"Asia/Qatar"        },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

const routes = [
  // Kyiv hub
  { from:"KBP", to:"FRA", airline:"PS", duration:3.0, price:189, number:"PS101"  },
  { from:"KBP", to:"FRA", airline:"LH", duration:3.0, price:215, number:"LH1452" },
  { from:"KBP", to:"LHR", airline:"PS", duration:3.5, price:225, number:"PS201"  },
  { from:"KBP", to:"CDG", airline:"PS", duration:3.2, price:199, number:"PS301"  },
  { from:"KBP", to:"CDG", airline:"AF", duration:3.2, price:235, number:"AF1580" },
  { from:"KBP", to:"IST", airline:"TK", duration:2.5, price:155, number:"TK401"  },
  { from:"KBP", to:"WAW", airline:"PS", duration:1.5, price:89,  number:"PS501"  },
  { from:"KBP", to:"WAW", airline:"W6", duration:1.5, price:69,  number:"W6501"  },
  { from:"KBP", to:"BCN", airline:"W6", duration:4.0, price:179, number:"W6601"  },
  { from:"KBP", to:"VIE", airline:"PS", duration:2.0, price:135, number:"PS701"  },
  { from:"KBP", to:"VIE", airline:"OS", duration:2.0, price:155, number:"OS712"  },
  { from:"KBP", to:"AMS", airline:"KL", duration:3.0, price:205, number:"KL3102" },
  { from:"KBP", to:"MUC", airline:"LH", duration:2.8, price:195, number:"LH1630" },
  { from:"KBP", to:"PRG", airline:"W6", duration:2.2, price:99,  number:"W6701"  },
  { from:"KBP", to:"BUD", airline:"W6", duration:2.0, price:89,  number:"W6801"  },
  { from:"KBP", to:"ZRH", airline:"LX", duration:3.1, price:229, number:"LX1405" },
  { from:"KBP", to:"DXB", airline:"EK", duration:5.5, price:420, number:"EK147"  },
  // Frankfurt hub
  { from:"FRA", to:"KBP", airline:"LH", duration:3.0, price:215, number:"LH1453" },
  { from:"FRA", to:"LHR", airline:"LH", duration:2.0, price:185, number:"LH900"  },
  { from:"FRA", to:"DXB", airline:"LH", duration:6.5, price:460, number:"LH630"  },
  { from:"FRA", to:"IST", airline:"TK", duration:3.5, price:285, number:"TK1680" },
  { from:"FRA", to:"BCN", airline:"LH", duration:2.5, price:175, number:"LH1150" },
  { from:"FRA", to:"MAD", airline:"IB", duration:2.7, price:180, number:"IB3114" },
  { from:"FRA", to:"FCO", airline:"LH", duration:2.0, price:165, number:"LH240"  },
  { from:"FRA", to:"ATH", airline:"LH", duration:3.0, price:220, number:"LH1790" },
  { from:"FRA", to:"DOH", airline:"QR", duration:6.0, price:490, number:"QR68"   },
  // London hub
  { from:"LHR", to:"KBP", airline:"BA", duration:3.5, price:235, number:"BA891"  },
  { from:"LHR", to:"FRA", airline:"BA", duration:2.0, price:180, number:"BA902"  },
  { from:"LHR", to:"CDG", airline:"BA", duration:1.3, price:125, number:"BA304"  },
  { from:"LHR", to:"BCN", airline:"BA", duration:2.5, price:165, number:"BA476"  },
  { from:"LHR", to:"DXB", airline:"EK", duration:7.0, price:530, number:"EK001"  },
  { from:"LHR", to:"DXB", airline:"BA", duration:7.0, price:510, number:"BA107"  },
  { from:"LHR", to:"MAD", airline:"IB", duration:2.2, price:140, number:"IB3166" },
  { from:"LHR", to:"FCO", airline:"BA", duration:2.5, price:155, number:"BA552"  },
  { from:"LHR", to:"IST", airline:"TK", duration:4.0, price:270, number:"TK1988" },
  { from:"LHR", to:"AMS", airline:"KL", duration:1.3, price:115, number:"KL1010" },
  { from:"LHR", to:"DOH", airline:"QR", duration:6.5, price:510, number:"QR5"    },
  // Paris hub
  { from:"CDG", to:"LHR", airline:"AF", duration:1.3, price:130, number:"AF1081" },
  { from:"CDG", to:"FRA", airline:"AF", duration:1.5, price:155, number:"AF1232" },
  { from:"CDG", to:"KBP", airline:"AF", duration:3.2, price:240, number:"AF1579" },
  { from:"CDG", to:"BCN", airline:"AF", duration:2.0, price:145, number:"AF1549" },
  { from:"CDG", to:"IST", airline:"TK", duration:3.8, price:255, number:"TK1832" },
  { from:"CDG", to:"DXB", airline:"EK", duration:6.5, price:480, number:"EK074"  },
  { from:"CDG", to:"MAD", airline:"AF", duration:1.8, price:125, number:"AF1300" },
  { from:"CDG", to:"FCO", airline:"AF", duration:2.2, price:155, number:"AF1220" },
  { from:"CDG", to:"LIS", airline:"AF", duration:2.3, price:140, number:"AF1162" },
  // Istanbul hub
  { from:"IST", to:"KBP", airline:"TK", duration:2.5, price:160, number:"TK402"  },
  { from:"IST", to:"FRA", airline:"TK", duration:3.5, price:275, number:"TK1681" },
  { from:"IST", to:"DXB", airline:"TK", duration:4.0, price:325, number:"TK761"  },
  { from:"IST", to:"LHR", airline:"TK", duration:4.0, price:270, number:"TK1989" },
  { from:"IST", to:"BCN", airline:"TK", duration:4.2, price:285, number:"TK1840" },
  { from:"IST", to:"ATH", airline:"TK", duration:1.5, price:125, number:"TK1841" },
  { from:"IST", to:"DOH", airline:"QR", duration:2.5, price:195, number:"QR493"  },
  // Amsterdam hub
  { from:"AMS", to:"LHR", airline:"KL", duration:1.3, price:110, number:"KL1011" },
  { from:"AMS", to:"BCN", airline:"KL", duration:2.8, price:160, number:"KL1668" },
  { from:"AMS", to:"KBP", airline:"KL", duration:3.0, price:210, number:"KL3103" },
  { from:"AMS", to:"DXB", airline:"KL", duration:7.0, price:470, number:"KL405"  },
  { from:"AMS", to:"FCO", airline:"KL", duration:2.5, price:155, number:"KL1606" },
  // Dubai hub
  { from:"DXB", to:"LHR", airline:"EK", duration:7.0, price:540, number:"EK002"  },
  { from:"DXB", to:"FRA", airline:"EK", duration:6.5, price:465, number:"EK629"  },
  { from:"DXB", to:"CDG", airline:"EK", duration:6.5, price:485, number:"EK073"  },
  { from:"DXB", to:"KBP", airline:"EK", duration:5.5, price:425, number:"EK148"  },
  { from:"DXB", to:"IST", airline:"TK", duration:4.0, price:330, number:"TK762"  },
  { from:"DXB", to:"DOH", airline:"QR", duration:1.2, price:120, number:"QR530"  },
  // Budget / secondary
  { from:"WAW", to:"KBP", airline:"W6", duration:1.5, price:65,  number:"W6502"  },
  { from:"WAW", to:"LHR", airline:"FR", duration:2.5, price:79,  number:"FR8421" },
  { from:"WAW", to:"BCN", airline:"W6", duration:3.2, price:95,  number:"W6651"  },
  { from:"WAW", to:"FCO", airline:"W6", duration:2.8, price:89,  number:"W6900"  },
  { from:"BCN", to:"LHR", airline:"FR", duration:2.5, price:70,  number:"FR8422" },
  { from:"BCN", to:"MAD", airline:"IB", duration:1.2, price:75,  number:"IB3550" },
  { from:"MAD", to:"LIS", airline:"IB", duration:1.3, price:90,  number:"IB1028" },
  { from:"MAD", to:"FCO", airline:"IB", duration:2.5, price:135, number:"IB3442" },
  { from:"FCO", to:"LHR", airline:"BA", duration:2.5, price:160, number:"BA553"  },
  { from:"FCO", to:"ATH", airline:"AZ", duration:2.2, price:135, number:"AZ660"  },
  { from:"ATH", to:"IST", airline:"TK", duration:1.5, price:130, number:"TK1842" },
  { from:"ATH", to:"LHR", airline:"BA", duration:3.5, price:200, number:"BA642"  },
  { from:"PRG", to:"LHR", airline:"FR", duration:2.2, price:72,  number:"FR5502" },
  { from:"PRG", to:"BCN", airline:"W6", duration:3.0, price:85,  number:"W6751"  },
  { from:"BUD", to:"LHR", airline:"W6", duration:2.8, price:78,  number:"W6810"  },
  { from:"BUD", to:"BCN", airline:"W6", duration:3.0, price:88,  number:"W6850"  },
  { from:"ZRH", to:"LHR", airline:"LX", duration:2.0, price:195, number:"LX310"  },
  { from:"ZRH", to:"FRA", airline:"LX", duration:1.0, price:135, number:"LX904"  },
  { from:"CPH", to:"LHR", airline:"SK", duration:2.2, price:155, number:"SK503"  },
  { from:"CPH", to:"FRA", airline:"SK", duration:1.8, price:145, number:"SK673"  },
  { from:"ARN", to:"LHR", airline:"SK", duration:2.5, price:165, number:"SK527"  },
  { from:"ARN", to:"FRA", airline:"SK", duration:2.2, price:155, number:"SK669"  },
  { from:"DUB", to:"LHR", airline:"FR", duration:1.5, price:59,  number:"FR202"  },
  { from:"DUB", to:"BCN", airline:"FR", duration:2.5, price:69,  number:"FR5230" },
  { from:"BRU", to:"LHR", airline:"BA", duration:1.3, price:115, number:"BA392"  },
  { from:"BRU", to:"FRA", airline:"LH", duration:1.2, price:130, number:"LH998"  },
  { from:"LIS", to:"LHR", airline:"BA", duration:2.5, price:150, number:"BA488"  },
  { from:"LIS", to:"MAD", airline:"IB", duration:1.3, price:90,  number:"IB1029" },
  { from:"MXP", to:"LHR", airline:"BA", duration:2.2, price:145, number:"BA572"  },
  { from:"MXP", to:"FRA", airline:"LH", duration:1.5, price:140, number:"LH286"  },
  { from:"GVA", to:"LHR", airline:"BA", duration:2.0, price:160, number:"BA726"  },
  { from:"GVA", to:"FRA", airline:"LX", duration:1.0, price:130, number:"LX918"  },
  { from:"DOH", to:"LHR", airline:"QR", duration:6.5, price:520, number:"QR6"    },
  { from:"DOH", to:"FRA", airline:"QR", duration:6.0, price:495, number:"QR67"   },
  { from:"DOH", to:"DXB", airline:"QR", duration:1.2, price:125, number:"QR531"  },
  { from:"VIE", to:"KBP", airline:"OS", duration:2.0, price:150, number:"OS713"  },
  { from:"VIE", to:"LHR", airline:"OS", duration:2.5, price:185, number:"OS461"  },
  { from:"VIE", to:"FRA", airline:"OS", duration:1.5, price:140, number:"OS127"  },
  { from:"MUC", to:"LHR", airline:"LH", duration:2.2, price:185, number:"LH2482" },
  { from:"MUC", to:"KBP", airline:"LH", duration:2.8, price:200, number:"LH1631" },
  { from:"MUC", to:"IST", airline:"TK", duration:3.0, price:240, number:"TK1650" },
];

// ─── Build Flights ─────────────────────────────────────────────────────────────

function buildFlights(airlineMap, airportMap) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const allTimes = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const flights  = [];

  for (let day = 0; day < 45; day++) {
    for (const route of routes) {
      if (!airlineMap[route.airline] || !airportMap[route.from] || !airportMap[route.to]) continue;

      const times = [...allTimes].sort(() => Math.random() - 0.5).slice(0, rand(2, 5));
      for (const hour of times) {
        const departure = addDays(new Date(base), day);
        departure.setHours(hour, pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), 0, 0);
        const arrival = addHours(departure, route.duration);

        const dow        = departure.getDay();
        const isWeekend  = dow === 5 || dow === 6;
        const dayFactor  = day < 3 ? 0.90 : day < 7 ? 1.10 : day < 14 ? 1.05 : day < 21 ? 1.0 : 0.95;
        const timeFactor = hour < 7 || hour > 21 ? 0.90 : 1.0;
        const wkFactor   = isWeekend ? 1.08 : 1.0;
        const price      = Math.round(route.price * dayFactor * timeFactor * wkFactor);

        // Economy
        flights.push({
          flightNumber:       route.number,
          airlineId:          airlineMap[route.airline],
          departureAirportId: airportMap[route.from],
          arrivalAirportId:   airportMap[route.to],
          departureTime:      departure,
          arrivalTime:        arrival,
          price,
          cabinClass:    "ECONOMY",
          availableSeats: rand(10, 145),
          totalSeats:     180,
          amenities:      pick([
            ["USB charging"],
            ["USB charging", "Snacks"],
            ["USB charging", "Meal included"],
            ["Wi-Fi", "USB charging", "Meal included"],
            ["Wi-Fi", "USB charging", "Snacks", "Entertainment"],
          ]),
        });

        // Premium Economy (hauls ≥ 3h)
        if (route.duration >= 3.0 && Math.random() > 0.55) {
          flights.push({
            flightNumber:       route.number + "P",
            airlineId:          airlineMap[route.airline],
            departureAirportId: airportMap[route.from],
            arrivalAirportId:   airportMap[route.to],
            departureTime:      departure,
            arrivalTime:        arrival,
            price:              Math.round(price * 1.65),
            cabinClass:    "PREMIUM_ECONOMY",
            availableSeats: rand(4, 28),
            totalSeats:     36,
            amenities:      ["Wi-Fi", "Meal included", "USB charging", "Extra legroom", "Priority boarding"],
          });
        }

        // Business (price ≥ 120)
        if (route.price >= 120 && Math.random() > 0.45) {
          flights.push({
            flightNumber:       route.number + "B",
            airlineId:          airlineMap[route.airline],
            departureAirportId: airportMap[route.from],
            arrivalAirportId:   airportMap[route.to],
            departureTime:      departure,
            arrivalTime:        arrival,
            price:              Math.round(price * 2.9),
            cabinClass:    "BUSINESS",
            availableSeats: rand(2, 18),
            totalSeats:     24,
            amenities:      ["Wi-Fi", "Gourmet meals", "USB charging", "Lie-flat seat", "Lounge access", "Priority boarding"],
          });
        }

        // First (only premium long-haul)
        if (route.price >= 400 && Math.random() > 0.65) {
          flights.push({
            flightNumber:       route.number + "F",
            airlineId:          airlineMap[route.airline],
            departureAirportId: airportMap[route.from],
            arrivalAirportId:   airportMap[route.to],
            departureTime:      departure,
            arrivalTime:        arrival,
            price:              Math.round(price * 5.5),
            cabinClass:    "FIRST",
            availableSeats: rand(1, 6),
            totalSeats:     8,
            amenities:      ["Private suite", "Chef meals", "Chauffeur service", "Spa access", "Lounge access", "Lie-flat bed"],
          });
        }
      }
    }
  }
  return flights;
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

const hotelsData = [
  // Kyiv
  { name:"Fairmont Grand Hotel Kyiv",         city:"Kyiv",       country:"Ukraine",        stars:5, rating:4.8, reviewCount:1842,
    description:"5-star luxury hotel in the heart of Kyiv with stunning views of the Dnipro river.",
    address:"Naberezhno-Khreshchatytska St, 1, Kyiv",
    imageUrls:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Room Service","Valet Parking"],
    latitude:50.4501, longitude:30.5234 },

  { name:"InterContinental Kyiv",              city:"Kyiv",       country:"Ukraine",        stars:5, rating:4.6, reviewCount:1124,
    description:"Contemporary 5-star hotel in the city center, offering panoramic views and world-class service.",
    address:"Velyka Zhytomyrska St, 2A, Kyiv",
    imageUrls:["https://images.unsplash.com/photo-1551882547-ff40c4a49f4e?w=800","https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Business Center","Concierge"],
    latitude:50.4509, longitude:30.5215 },

  { name:"Premier Palace Hotel Kyiv",          city:"Kyiv",       country:"Ukraine",        stars:4, rating:4.3, reviewCount:876,
    description:"Elegant 4-star hotel located steps from Shevchenko Park in central Kyiv.",
    address:"Bulvar Shevchenka, 5–7, Kyiv",
    imageUrls:["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"],
    amenities:["Restaurant","Bar","Gym","Free WiFi","Business Center","Room Service"],
    latitude:50.4454, longitude:30.5104 },

  { name:"Ibis Kyiv City Centre",              city:"Kyiv",       country:"Ukraine",        stars:3, rating:4.0, reviewCount:3210,
    description:"Affordable and comfortable city-centre hotel with easy access to Maidan and metro.",
    address:"Chervonoarmiiska St, 9/2, Kyiv",
    imageUrls:["https://images.unsplash.com/photo-1534003328487-28cd91e7b5e0?w=800","https://images.unsplash.com/photo-1629794226066-349748040fb7?w=800"],
    amenities:["Restaurant","Bar","Free WiFi","24-hour Reception"],
    latitude:50.4368, longitude:30.5215 },

  // Frankfurt
  { name:"Steigenberger Frankfurter Hof",      city:"Frankfurt",  country:"Germany",        stars:5, rating:4.7, reviewCount:2103,
    description:"A Frankfurt institution since 1876 — grand architecture, impeccable service, central location.",
    address:"Am Kaiserplatz, 60311 Frankfurt",
    imageUrls:["https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"],
    amenities:["Restaurant","Bar","Gym","Spa","Free WiFi","Concierge","Business Center","Room Service"],
    latitude:50.1127, longitude:8.6774 },

  { name:"Hilton Frankfurt City Centre",       city:"Frankfurt",  country:"Germany",        stars:4, rating:4.5, reviewCount:1567,
    description:"Modern hotel in central Frankfurt, ideal for business and leisure travelers.",
    address:"Hochstraße 4, 60313 Frankfurt",
    imageUrls:["https://images.unsplash.com/photo-1551882547-ff40c4a49f4e?w=800","https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"],
    amenities:["Restaurant","Bar","Gym","Free WiFi","Business Center","Room Service"],
    latitude:50.1109, longitude:8.6821 },

  { name:"Motel One Frankfurt-Niederrad",      city:"Frankfurt",  country:"Germany",        stars:3, rating:4.1, reviewCount:2890,
    description:"Stylish budget-design hotel near Frankfurt trade fair, great value for money.",
    address:"Hahnstraße 37, 60528 Frankfurt",
    imageUrls:["https://images.unsplash.com/photo-1609766934025-9b1b1bf0a5d9?w=800","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"],
    amenities:["Bar","Free WiFi","24-hour Reception"],
    latitude:50.0893, longitude:8.6507 },

  // London
  { name:"The Ritz London",                    city:"London",     country:"United Kingdom", stars:5, rating:4.9, reviewCount:3241,
    description:"Iconic luxury hotel in Piccadilly. A symbol of British elegance since 1906.",
    address:"150 Piccadilly, London W1J 9BR",
    imageUrls:["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"],
    amenities:["Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Butler Service","Afternoon Tea"],
    latitude:51.5074, longitude:-0.1422 },

  { name:"The Savoy London",                   city:"London",     country:"United Kingdom", stars:5, rating:4.8, reviewCount:2987,
    description:"London's most iconic hotel on the Strand, blending Art Deco grandeur with world-class service.",
    address:"Strand, London WC2R 0EZ",
    imageUrls:["https://images.unsplash.com/photo-1601565415267-724db0a8b7fe?w=800","https://images.unsplash.com/photo-1549294413-26f195200c16?w=800"],
    amenities:["Spa","Pool","Restaurant","Bar","Gym","Free WiFi","Concierge","Butler Service"],
    latitude:51.5103, longitude:-0.1202 },

  { name:"The Hoxton Shoreditch",              city:"London",     country:"United Kingdom", stars:4, rating:4.5, reviewCount:4102,
    description:"Vibrant East London hotel with a buzzing lobby bar and creative neighbourhood vibe.",
    address:"81 Great Eastern St, London EC2A 3HU",
    imageUrls:["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800"],
    amenities:["Restaurant","Bar","Free WiFi","24-hour Reception","Breakfast included"],
    latitude:51.5249, longitude:-0.0806 },

  { name:"citizenM London Bankside",           city:"London",     country:"United Kingdom", stars:3, rating:4.4, reviewCount:5312,
    description:"Affordable luxury on the South Bank, steps from Tate Modern with smartly designed rooms.",
    address:"20 Lavington St, London SE1 0NZ",
    imageUrls:["https://images.unsplash.com/photo-1534003328487-28cd91e7b5e0?w=800","https://images.unsplash.com/photo-1629794226066-349748040fb7?w=800"],
    amenities:["Restaurant","Bar","Free WiFi","24-hour Reception"],
    latitude:51.5063, longitude:-0.1000 },

  // Paris
  { name:"Four Seasons Hotel George V Paris",  city:"Paris",      country:"France",         stars:5, rating:4.9, reviewCount:2734,
    description:"The pinnacle of Parisian luxury — restored 1920s palace with three Michelin-star restaurant.",
    address:"31 Av. George V, 75008 Paris",
    imageUrls:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Butler Service","Michelin Restaurant"],
    latitude:48.8699, longitude:2.3034 },

  { name:"Hotel Sofitel Paris Le Faubourg",    city:"Paris",      country:"France",         stars:5, rating:4.7, reviewCount:1893,
    description:"Refined luxury in the heart of Paris, steps from Place de la Concorde.",
    address:"15 Rue Boissy d'Anglas, 75008 Paris",
    imageUrls:["https://images.unsplash.com/photo-1601565415267-724db0a8b7fe?w=800","https://images.unsplash.com/photo-1549294413-26f195200c16?w=800"],
    amenities:["Spa","Restaurant","Bar","Free WiFi","Concierge","Room Service","Valet Parking"],
    latitude:48.8698, longitude:2.3232 },

  { name:"Hotel des Grands Boulevards",        city:"Paris",      country:"France",         stars:4, rating:4.6, reviewCount:3210,
    description:"Charming boutique hotel on the historic Grands Boulevards with rooftop bar.",
    address:"17 Blvd Poissonnière, 75002 Paris",
    imageUrls:["https://images.unsplash.com/photo-1609766934025-9b1b1bf0a5d9?w=800","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"],
    amenities:["Restaurant","Bar","Free WiFi","Rooftop Terrace","Concierge"],
    latitude:48.8722, longitude:2.3481 },

  // Istanbul
  { name:"Four Seasons Istanbul at Sultanahmet", city:"Istanbul", country:"Turkey",         stars:5, rating:4.9, reviewCount:2198,
    description:"Intimate luxury in a restored Ottoman prison, steps from the Blue Mosque.",
    address:"Tevkifhane Sok. No. 1, 34110 Istanbul",
    imageUrls:["https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800","https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"],
    amenities:["Spa","Restaurant","Bar","Pool","Gym","Free WiFi","Concierge","Bosphorus View"],
    latitude:41.0055, longitude:28.9784 },

  { name:"Marriott Istanbul Asia",             city:"Istanbul",   country:"Turkey",         stars:5, rating:4.6, reviewCount:1456,
    description:"Contemporary hotel on the Asian side of Istanbul with Bosphorus views.",
    address:"Hünkar İskelesi Cd. No:1, 34726 Istanbul",
    imageUrls:["https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800","https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Bosphorus View"],
    latitude:40.9927, longitude:29.0277 },

  // Warsaw
  { name:"Radisson Blu Centrum Hotel Warsaw",  city:"Warsaw",     country:"Poland",         stars:4, rating:4.4, reviewCount:2341,
    description:"Centrally located in Warsaw, perfect base for business and exploring the city.",
    address:"Grzybowska 24, 00-132 Warsaw",
    imageUrls:["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"],
    amenities:["Restaurant","Bar","Gym","Free WiFi","Business Center","Sauna"],
    latitude:52.2297, longitude:20.9976 },

  { name:"Puro Hotel Warsaw Centrum",          city:"Warsaw",     country:"Poland",         stars:4, rating:4.5, reviewCount:1876,
    description:"Contemporary design hotel in the heart of Warsaw with stylish rooms and excellent breakfast.",
    address:"ul. Krucza 16/22, 00-526 Warsaw",
    imageUrls:["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"],
    amenities:["Restaurant","Bar","Gym","Free WiFi","Spa","Breakfast included"],
    latitude:52.2234, longitude:21.0125 },

  // Barcelona
  { name:"W Barcelona",                        city:"Barcelona",  country:"Spain",          stars:5, rating:4.7, reviewCount:3891,
    description:"Iconic sail-shaped hotel on Barceloneta beach with breathtaking sea views.",
    address:"Pl. de la Rosa dels Vents, 1, 08039 Barcelona",
    imageUrls:["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Beach Access","Free WiFi","Rooftop Bar"],
    latitude:41.3748, longitude:2.1896 },

  { name:"Hotel Arts Barcelona",               city:"Barcelona",  country:"Spain",          stars:5, rating:4.8, reviewCount:2654,
    description:"Soaring 44-story luxury tower on the beachfront with stunning Mediterranean views.",
    address:"Carrer de la Marina, 19-21, 08005 Barcelona",
    imageUrls:["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Beach Access","Free WiFi"],
    latitude:41.3873, longitude:2.1971 },

  { name:"Ohla Eixample Hotel",                city:"Barcelona",  country:"Spain",          stars:4, rating:4.4, reviewCount:1987,
    description:"Boutique hotel in the heart of Eixample with a rooftop terrace and outdoor pool.",
    address:"Carrer del Còrsega, 289, 08008 Barcelona",
    imageUrls:["https://images.unsplash.com/photo-1551882547-ff40c4a49f4e?w=800","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"],
    amenities:["Pool","Restaurant","Bar","Gym","Free WiFi","Rooftop Terrace"],
    latitude:41.3933, longitude:2.1532 },

  // Amsterdam
  { name:"Waldorf Astoria Amsterdam",          city:"Amsterdam",  country:"Netherlands",    stars:5, rating:4.8, reviewCount:2109,
    description:"Six interconnected 17th-century canal houses transformed into a world-class hotel.",
    address:"Herengracht 542-556, 1017 CG Amsterdam",
    imageUrls:["https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"],
    amenities:["Spa","Restaurant","Bar","Free WiFi","Concierge","Canal Views","Butler Service"],
    latitude:52.3614, longitude:4.8979 },

  { name:"Hotel V Nesplein",                   city:"Amsterdam",  country:"Netherlands",    stars:4, rating:4.6, reviewCount:2876,
    description:"Trendy design hotel in Amsterdam's Jordaan neighbourhood with a cosy lounge bar.",
    address:"Nes 49, 1012 KD Amsterdam",
    imageUrls:["https://images.unsplash.com/photo-1534003328487-28cd91e7b5e0?w=800","https://images.unsplash.com/photo-1629794226066-349748040fb7?w=800"],
    amenities:["Restaurant","Bar","Free WiFi","Bicycle Rental","Lounge"],
    latitude:52.3732, longitude:4.8943 },

  // Vienna
  { name:"Park Hyatt Vienna",                  city:"Vienna",     country:"Austria",        stars:5, rating:4.9, reviewCount:1943,
    description:"Grand hotel in a meticulously restored 1915 bank building in Vienna's first district.",
    address:"Am Hof 2, 1010 Wien",
    imageUrls:["https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800","https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Wine Cellar"],
    latitude:48.2133, longitude:16.3639 },

  { name:"Hotel Sacher Wien",                  city:"Vienna",     country:"Austria",        stars:5, rating:4.7, reviewCount:3120,
    description:"Vienna's most celebrated hotel, home of the original Sachertorte since 1876.",
    address:"Philharmoniker Str. 4, 1010 Wien",
    imageUrls:["https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
    amenities:["Spa","Restaurant","Bar","Free WiFi","Concierge","Café Sacher","Room Service"],
    latitude:48.2031, longitude:16.3688 },

  // Dubai
  { name:"Atlantis The Palm Dubai",            city:"Dubai",      country:"UAE",            stars:5, rating:4.6, reviewCount:5678,
    description:"Iconic resort on Palm Jumeirah with a waterpark, private beach and world-class dining.",
    address:"Crescent Rd, The Palm Jumeirah, Dubai",
    imageUrls:["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"],
    amenities:["Waterpark","Private Beach","Pool","Spa","Multiple Restaurants","Bar","Free WiFi","Aquarium"],
    latitude:25.1304, longitude:55.1171 },

  { name:"Burj Al Arab Jumeirah",              city:"Dubai",      country:"UAE",            stars:5, rating:4.9, reviewCount:4321,
    description:"The world's most luxurious hotel — the iconic sail-shaped tower standing on its own island.",
    address:"Jumeirah Rd, Umm Suqeim, Dubai",
    imageUrls:["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800","https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800"],
    amenities:["Helipad","Private Beach","Pool","Spa","Michelin Restaurant","Bar","Free WiFi","Butler Service"],
    latitude:25.1413, longitude:55.1853 },

  { name:"Address Downtown Dubai",             city:"Dubai",      country:"UAE",            stars:5, rating:4.7, reviewCount:3456,
    description:"Sleek tower hotel adjacent to Dubai Mall and Burj Khalifa with stunning downtown views.",
    address:"Downtown Dubai, Dubai",
    imageUrls:["https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800","https://images.unsplash.com/photo-1534003328487-28cd91e7b5e0?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Burj Khalifa View","Concierge"],
    latitude:25.1918, longitude:55.2796 },

  // Rome
  { name:"Hotel Hassler Roma",                 city:"Rome",       country:"Italy",          stars:5, rating:4.8, reviewCount:1987,
    description:"Legendary 5-star hotel at the top of the Spanish Steps with sweeping views over Rome.",
    address:"Piazza della Trinità dei Monti, 6, 00187 Roma",
    imageUrls:["https://images.unsplash.com/photo-1601565415267-724db0a8b7fe?w=800","https://images.unsplash.com/photo-1549294413-26f195200c16?w=800"],
    amenities:["Restaurant","Bar","Spa","Gym","Free WiFi","Concierge","Rooftop Terrace"],
    latitude:41.9059, longitude:12.4823 },

  { name:"Palazzo Manfredi Roma",              city:"Rome",       country:"Italy",          stars:5, rating:4.7, reviewCount:1234,
    description:"Intimate boutique hotel with a Michelin-star rooftop restaurant facing the Colosseum.",
    address:"Via Labicana, 125, 00184 Roma",
    imageUrls:["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"],
    amenities:["Restaurant","Bar","Free WiFi","Concierge","Colosseum View","Room Service"],
    latitude:41.8902, longitude:12.4924 },

  // Madrid
  { name:"Mandarin Oriental Ritz Madrid",      city:"Madrid",     country:"Spain",          stars:5, rating:4.9, reviewCount:2312,
    description:"Madrid's legendary palace hotel, meticulously restored, opposite the Prado Museum.",
    address:"Pl. de la Lealtad, 5, 28014 Madrid",
    imageUrls:["https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800","https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Garden Terrace"],
    latitude:40.4148, longitude:-3.6931 },

  // Athens
  { name:"Hotel Grande Bretagne Athens",       city:"Athens",     country:"Greece",         stars:5, rating:4.8, reviewCount:2543,
    description:"Athens' grandest hotel facing Syntagma Square and the Acropolis since 1874.",
    address:"Vasileos Georgiou A 1, 10564 Athens",
    imageUrls:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Rooftop Pool","Acropolis View"],
    latitude:37.9754, longitude:23.7358 },

  // Doha
  { name:"St. Regis Doha",                     city:"Doha",       country:"Qatar",          stars:5, rating:4.8, reviewCount:1876,
    description:"Palatial beachfront hotel on West Bay Lagoon with extravagant interiors and private beach.",
    address:"Doha West Bay Lagoon, Doha",
    imageUrls:["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"],
    amenities:["Private Beach","Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Butler Service"],
    latitude:25.3548, longitude:51.5310 },

  // Prague
  { name:"Augustine Prague",                   city:"Prague",     country:"Czech Republic", stars:5, rating:4.7, reviewCount:1654,
    description:"Romantic hotel in a restored 13th-century monastery in Prague's Malá Strana district.",
    address:"Letenská 12/33, 118 00 Praha 1",
    imageUrls:["https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"],
    amenities:["Restaurant","Bar","Spa","Free WiFi","Concierge","Library","Garden"],
    latitude:50.0898, longitude:14.4039 },

  // Budapest
  { name:"New York Palace Budapest",           city:"Budapest",   country:"Hungary",        stars:5, rating:4.7, reviewCount:2109,
    description:"Ornate Belle Époque palace hotel with the world-famous New York Café on the ground floor.",
    address:"Erzsébet körút 9-11, 1073 Budapest",
    imageUrls:["https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800","https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800"],
    amenities:["Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Historic Café"],
    latitude:47.4976, longitude:19.0698 },

  // Zurich
  { name:"Baur au Lac Zurich",                 city:"Zurich",     country:"Switzerland",    stars:5, rating:4.9, reviewCount:1432,
    description:"Switzerland's finest hotel on the shores of Lake Zurich, in family ownership since 1844.",
    address:"Talstrasse 1, 8001 Zürich",
    imageUrls:["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","https://images.unsplash.com/photo-1601565415267-724db0a8b7fe?w=800"],
    amenities:["Restaurant","Bar","Spa","Free WiFi","Concierge","Lake View","Garden"],
    latitude:47.3669, longitude:8.5401 },

  // Lisbon
  { name:"Bairro Alto Hotel Lisboa",           city:"Lisbon",     country:"Portugal",       stars:5, rating:4.8, reviewCount:1789,
    description:"Elegant boutique hotel in an 18th-century palace in Lisbon's most vibrant neighbourhood.",
    address:"Praça Luís de Camões 2, 1200-243 Lisboa",
    imageUrls:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800"],
    amenities:["Restaurant","Bar","Spa","Free WiFi","Rooftop Terrace","Concierge"],
    latitude:38.7120, longitude:-9.1416 },

  // Milan
  { name:"Bulgari Hotel Milano",               city:"Milan",      country:"Italy",          stars:5, rating:4.9, reviewCount:1654,
    description:"Discreet luxury in a private garden near Via Montenapoleone, Milan's fashion heartland.",
    address:"Via Privata Fratelli Gabba, 7b, 20121 Milano",
    imageUrls:["https://images.unsplash.com/photo-1549294413-26f195200c16?w=800","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"],
    amenities:["Spa","Pool","Restaurant","Bar","Gym","Free WiFi","Concierge","Private Garden"],
    latitude:45.4731, longitude:9.1965 },

  // Copenhagen
  { name:"Nimb Hotel Copenhagen",              city:"Copenhagen", country:"Denmark",        stars:5, rating:4.8, reviewCount:1345,
    description:"Moorish-inspired boutique hotel in Tivoli Gardens with 14 uniquely designed rooms.",
    address:"Bernstorffsgade 5, 1577 Copenhagen",
    imageUrls:["https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"],
    amenities:["Restaurant","Bar","Spa","Free WiFi","Concierge","Tivoli Access"],
    latitude:55.6736, longitude:12.5681 },

  // Stockholm
  { name:"Grand Hôtel Stockholm",              city:"Stockholm",  country:"Sweden",         stars:5, rating:4.7, reviewCount:1987,
    description:"Sweden's most prestigious hotel facing the Royal Palace and Stockholm harbour since 1874.",
    address:"Södra Blasieholmshamnen 8, 103 27 Stockholm",
    imageUrls:["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
    amenities:["Spa","Restaurant","Bar","Gym","Free WiFi","Harbour View","Concierge"],
    latitude:59.3295, longitude:18.0756 },

  // Geneva
  { name:"Hôtel Beau-Rivage Geneva",           city:"Geneva",     country:"Switzerland",    stars:5, rating:4.8, reviewCount:1567,
    description:"Legendary lakeside palace hotel on the shores of Lake Geneva, family-owned since 1865.",
    address:"Quai du Mont-Blanc 13, 1201 Genève",
    imageUrls:["https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
    amenities:["Restaurant","Bar","Spa","Free WiFi","Concierge","Lake View","Room Service"],
    latitude:46.2082, longitude:6.1524 },

  // Brussels
  { name:"Hotel Amigo Brussels",               city:"Brussels",   country:"Belgium",        stars:5, rating:4.7, reviewCount:1432,
    description:"Sophisticated luxury hotel steps from the Grand Place with a warm Belgian welcome.",
    address:"Rue de l'Amigo 1, 1000 Bruxelles",
    imageUrls:["https://images.unsplash.com/photo-1601565415267-724db0a8b7fe?w=800","https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800"],
    amenities:["Restaurant","Bar","Spa","Gym","Free WiFi","Concierge","Room Service"],
    latitude:50.8462, longitude:4.3500 },

  // Munich
  { name:"Bayerischer Hof Munich",             city:"Munich",     country:"Germany",        stars:5, rating:4.8, reviewCount:2234,
    description:"Munich's grandest hotel in the historic city centre with a rooftop spa and cinema.",
    address:"Promenadeplatz 2-6, 80333 München",
    imageUrls:["https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800","https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Cinema","Rooftop Bar"],
    latitude:48.1408, longitude:11.5706 },

  // Dublin
  { name:"The Merrion Hotel Dublin",           city:"Dublin",     country:"Ireland",        stars:5, rating:4.8, reviewCount:1876,
    description:"Dublin's finest hotel in four restored Georgian townhouses, home of Ireland's best art collection.",
    address:"Upper Merrion St, Dublin 2",
    imageUrls:["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","https://images.unsplash.com/photo-1549294413-26f195200c16?w=800"],
    amenities:["Pool","Spa","Restaurant","Bar","Gym","Free WiFi","Concierge","Art Collection"],
    latitude:53.3381, longitude:-6.2523 },
];

// ─── Room configs per star rating ─────────────────────────────────────────────

const roomConfigByStars = {
  5: [
    { type:"Superior Room",    bedType:"Queen bed",  multiplier:1.0,  capacity:2, count:10 },
    { type:"Deluxe Room",      bedType:"King bed",   multiplier:1.45, capacity:2, count:8  },
    { type:"Junior Suite",     bedType:"King bed",   multiplier:2.1,  capacity:2, count:6  },
    { type:"Suite",            bedType:"King bed",   multiplier:3.2,  capacity:4, count:4  },
    { type:"Signature Suite",  bedType:"King bed",   multiplier:4.8,  capacity:4, count:2  },
  ],
  4: [
    { type:"Standard Room",    bedType:"Double bed", multiplier:1.0,  capacity:2, count:12 },
    { type:"Superior Room",    bedType:"Queen bed",  multiplier:1.35, capacity:2, count:8  },
    { type:"Deluxe Room",      bedType:"King bed",   multiplier:1.8,  capacity:2, count:6  },
    { type:"Junior Suite",     bedType:"King bed",   multiplier:2.6,  capacity:4, count:3  },
  ],
  3: [
    { type:"Standard Room",    bedType:"Double bed", multiplier:1.0,  capacity:2, count:14 },
    { type:"Twin Room",        bedType:"Twin beds",  multiplier:1.0,  capacity:2, count:6  },
    { type:"Superior Room",    bedType:"Queen bed",  multiplier:1.5,  capacity:2, count:4  },
  ],
};

const basePriceByStars = { 5:230, 4:130, 3:75 };

const amenityPool = [
  "Air conditioning","Flat-screen TV","Mini bar","Safe","Free WiFi",
  "Espresso machine","Bathrobe & slippers","Marble bathroom",
  "City view","Blackout curtains","Work desk","Rain shower",
  "Soaking tub","Smart TV","Nespresso machine",
];

// ─── Test users ────────────────────────────────────────────────────────────────

const testUsers = [
  { firstName:"Emma",   lastName:"Johnson",   email:"emma.johnson@example.com",  phone:"+441234567001", address:"12 Baker Street, London" },
  { firstName:"Liam",   lastName:"Mueller",   email:"liam.mueller@example.com",  phone:"+491234567002", address:"Hauptstraße 45, Berlin"  },
  { firstName:"Sofia",  lastName:"Marchetti", email:"sofia.marchetti@example.com", phone:"+391234567003", address:"Via Roma 7, Milan"      },
  { firstName:"Noah",   lastName:"Dupont",    email:"noah.dupont@example.com",   phone:"+331234567004", address:"Rue de Rivoli 22, Paris" },
  { firstName:"Mia",    lastName:"García",    email:"mia.garcia@example.com",    phone:"+341234567005", address:"Calle Mayor 15, Madrid"  },
  { firstName:"Ethan",  lastName:"Brown",     email:"ethan.brown@example.com",   phone:"+12125550101",  address:"5th Ave, New York"       },
  { firstName:"Amelia", lastName:"Schmidt",   email:"amelia.schmidt@example.com", phone:"+491234567008", address:"Friedrichstraße 3, Frankfurt" },
  { firstName:"Lucas",  lastName:"Kowalski",  email:"lucas.kowalski@example.com", phone:"+481234567009", address:"ul. Nowy Świat 10, Warsaw" },
  { firstName:"Olivia", lastName:"Andersen",  email:"olivia.andersen@example.com", phone:"+451234567010", address:"Strøget 5, Copenhagen"  },
  { firstName:"Ava",    lastName:"Okonkwo",   email:"ava.okonkwo@example.com",   phone:"+9714567011",   address:"JBR Walk, Dubai"         },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed…\n");

  // 1. Clear all data (order matters for FK constraints)
  process.stdout.write("  Clearing database… ");
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
  // Remove non-admin users
  await prisma.refreshToken.deleteMany({ where: { user: { role: "CLIENT" } } });
  await prisma.paymentMethod.deleteMany({ where: { user: { role: "CLIENT" } } });
  await prisma.user.deleteMany({ where: { role: "CLIENT" } });
  console.log("done");

  // 2. Airlines
  const createdAirlines = await Promise.all(airlines.map((a) => prisma.airline.create({ data: a })));
  const airlineMap = Object.fromEntries(createdAirlines.map((a) => [a.iata, a.id]));
  console.log(`  ✓ ${createdAirlines.length} airlines`);

  // 3. Airports
  const createdAirports = await Promise.all(airports.map((a) => prisma.airport.create({ data: a })));
  const airportMap = Object.fromEntries(createdAirports.map((a) => [a.iata, a.id]));
  console.log(`  ✓ ${createdAirports.length} airports`);

  // 4. Flights — batch insert in chunks of 500
  const flightData = buildFlights(airlineMap, airportMap);
  const CHUNK = 500;
  for (let i = 0; i < flightData.length; i += CHUNK) {
    await prisma.flight.createMany({ data: flightData.slice(i, i + CHUNK) });
  }
  console.log(`  ✓ ${flightData.length} flights`);

  // 5. Hotels + rooms
  let totalRooms = 0;
  for (const hData of hotelsData) {
    const hotel = await prisma.hotel.create({ data: hData });
    const base  = basePriceByStars[hotel.stars] || 100;
    const rConf = roomConfigByStars[hotel.stars] || roomConfigByStars[4];
    const rooms = [];

    rConf.forEach((rt, ti) => {
      for (let i = 1; i <= rt.count; i++) {
        const roomNum  = `${ti + 1}${String(i).padStart(3, "0")}`;
        const viewWord = pick(["city","garden","pool","sea","mountain","courtyard"]);
        const ams      = [...amenityPool].sort(() => Math.random() - 0.5).slice(0, rand(4, 7));
        rooms.push({
          hotelId:       hotel.id,
          roomNumber:    roomNum,
          type:          rt.type,
          bedType:       rt.bedType,
          description:   `${rt.type} featuring a ${rt.bedType} with ${viewWord} views and premium amenities.`,
          pricePerNight: Math.round(base * rt.multiplier),
          capacity:      rt.capacity,
          amenities:     ams,
          imageUrls:     hotel.imageUrls.slice(0, 1),
          isAvailable:   true,
        });
      }
    });

    await prisma.room.createMany({ data: rooms });
    totalRooms += rooms.length;
  }
  console.log(`  ✓ ${hotelsData.length} hotels, ${totalRooms} rooms`);

  // 6. Test users (password: Test1234!)
  const hashed = await bcrypt.hash("Test1234!", 10);
  let userCount = 0;
  for (const u of testUsers) {
    try {
      await prisma.user.create({
        data: {
          ...u,
          password:    hashed,
          role:        "CLIENT",
          isActivated: true,
        },
      });
      userCount++;
    } catch {
      // skip if phone/email conflicts with existing admin
    }
  }
  console.log(`  ✓ ${userCount} test users (password: Test1234!)`);

  console.log(`
✅ Seed completed!
   Airlines : ${createdAirlines.length}
   Airports : ${createdAirports.length}
   Flights  : ${flightData.length}
   Hotels   : ${hotelsData.length}
   Rooms    : ${totalRooms}
   Users    : ${userCount}
`);
}

main()
  .catch((e) => { console.error("\n❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
