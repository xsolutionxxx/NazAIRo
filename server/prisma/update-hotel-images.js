/**
 * One-time script: update hotel imageUrls to 5–7 photos each.
 * Run with: node prisma/update-hotel-images.js
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ─── Image sets ───────────────────────────────────────────────────────────────
// All IDs are Unsplash photo IDs → https://images.unsplash.com/photo-{id}?w=900&auto=format&fit=crop&q=80

const U = (id) => `https://images.unsplash.com/photo-${id}?w=900&auto=format&fit=crop&q=80`;

// Named pools so we can mix and match naturally
const pool_room_luxury    = [
  U("1631049307264-da0ec9d70304"), // crisp white bed, sunlight
  U("1618773928121-c32242e63f39"), // city-view king room
  U("1582719508461-905c673771fd"), // window seat suite
  U("1571896349842-33c89424de2d"), // marble bath suite
  U("1506059612708-99d6c258160e"), // panoramic view bedroom
  U("1578683010236-d716f9a3f461"), // designer suite
  U("1509927083803-4bd519298ac4"), // minimal luxury room
];
const pool_room_standard  = [
  U("1534003328487-28cd91e7b5e0"), // cosy double room
  U("1629794226066-349748040fb7"), // modern hotel room
  U("1609766934025-9b1b1bf0a5d9"), // tidy twin/double
  U("1549294413-26f195200c16"),    // bedroom warm light
  U("1584132967334-10e028bd69f7"), // contemporary room
  U("1520250497591-112f2f40a3f4"), // rooftop/terrace room
];
const pool_lobby_grand    = [
  U("1542314831-068cd1dbfeeb"),    // palatial lobby
  U("1562778612-e1e0cda9915c"),    // art-deco facade
  U("1601565415267-724db0a8b7fe"), // hotel at dusk
  U("1551882547-ff40c4a49f4e"),    // modern exterior glass
  U("1563911302283-d2bc129e7570"), // chandelier lobby
];
const pool_outdoor        = [
  U("1566073771259-6a8506099945"), // infinity pool palms
  U("1582719478250-c89cae4dc85b"), // resort lap pool
  U("1540541338287-41700207dee6"), // blue pool terrace
  U("1533154683836-84ea7a0bc310"), // pool at sunset
  U("1445019980597-93fa8acb246c"), // beach / sun loungers
];
const pool_restaurant_bar = [
  U("1414235077428-338989a2e8c0"), // fine dining table
  U("1551632436-0b19d61c01e7"),    // rooftop bar
  U("1559329007-40df8a9345d8"),    // cocktail bar
  U("1455587734955-081b22074882"), // hotel bar evening
  U("1517248135467-4c7edcad34c4"), // restaurant interior
];
const pool_spa            = [
  U("1540555700478-4be289fbecef"), // spa treatment room
  U("1544161515-4ab6ce6db874"),    // pool / wellness
  U("1600334129128-685c5582fd35"), // hammam / steam room
];

// ─── Per-hotel image arrays ───────────────────────────────────────────────────

const hotelImages = {
  // KYIV
  "Fairmont Grand Hotel Kyiv": [
    pool_lobby_grand[0], pool_room_luxury[0], pool_room_luxury[1],
    pool_outdoor[0], pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[5],
  ],
  "InterContinental Kyiv": [
    pool_lobby_grand[3], pool_room_luxury[2], pool_room_luxury[6],
    pool_outdoor[2], pool_restaurant_bar[4], pool_spa[1], pool_room_luxury[3],
  ],
  "Premier Palace Hotel Kyiv": [
    pool_lobby_grand[1], pool_room_luxury[0], pool_restaurant_bar[1],
    pool_room_standard[0], pool_room_luxury[4], pool_outdoor[3],
  ],
  "Ibis Kyiv City Centre": [
    pool_room_standard[0], pool_room_standard[2], pool_restaurant_bar[3],
    pool_lobby_grand[3], pool_room_standard[4], pool_room_standard[1],
  ],

  // FRANKFURT
  "Steigenberger Frankfurter Hof": [
    pool_lobby_grand[2], pool_room_luxury[0], pool_room_luxury[3],
    pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[5], pool_lobby_grand[0],
  ],
  "Hilton Frankfurt City Centre": [
    pool_lobby_grand[3], pool_room_luxury[1], pool_room_luxury[6],
    pool_restaurant_bar[4], pool_outdoor[2], pool_room_luxury[4], pool_spa[2],
  ],
  "Motel One Frankfurt-Niederrad": [
    pool_room_standard[4], pool_room_standard[0], pool_restaurant_bar[3],
    pool_lobby_grand[4], pool_room_standard[2], pool_room_standard[5],
  ],

  // LONDON
  "The Ritz London": [
    pool_lobby_grand[0], pool_room_luxury[0], pool_room_luxury[2],
    pool_spa[0], pool_restaurant_bar[0], pool_room_luxury[5], pool_lobby_grand[2],
  ],
  "The Savoy London": [
    pool_lobby_grand[1], pool_room_luxury[3], pool_room_luxury[1],
    pool_outdoor[0], pool_restaurant_bar[1], pool_spa[1], pool_room_luxury[6],
  ],
  "The Hoxton Shoreditch": [
    pool_room_standard[3], pool_restaurant_bar[2], pool_lobby_grand[3],
    pool_room_standard[0], pool_room_standard[5], pool_restaurant_bar[4],
  ],
  "citizenM London Bankside": [
    pool_room_standard[4], pool_room_standard[1], pool_restaurant_bar[3],
    pool_lobby_grand[4], pool_room_standard[2], pool_room_standard[0],
  ],

  // PARIS
  "Four Seasons Hotel George V Paris": [
    pool_lobby_grand[0], pool_room_luxury[0], pool_room_luxury[2],
    pool_spa[0], pool_restaurant_bar[0], pool_outdoor[0], pool_room_luxury[4],
  ],
  "Hotel Sofitel Paris Le Faubourg": [
    pool_lobby_grand[2], pool_room_luxury[1], pool_room_luxury[5],
    pool_restaurant_bar[1], pool_spa[1], pool_room_luxury[3], pool_lobby_grand[4],
  ],
  "Hotel des Grands Boulevards": [
    pool_lobby_grand[1], pool_room_luxury[6], pool_restaurant_bar[2],
    pool_room_standard[3], pool_restaurant_bar[4], pool_room_luxury[0],
  ],

  // ISTANBUL
  "Four Seasons Istanbul at Sultanahmet": [
    pool_lobby_grand[0], pool_room_luxury[2], pool_room_luxury[4],
    pool_outdoor[3], pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[1],
  ],
  "Marriott Istanbul Asia": [
    pool_lobby_grand[3], pool_room_luxury[0], pool_outdoor[2],
    pool_restaurant_bar[4], pool_room_luxury[5], pool_spa[2], pool_room_luxury[3],
  ],

  // WARSAW
  "Radisson Blu Centrum Hotel Warsaw": [
    pool_lobby_grand[3], pool_room_luxury[1], pool_room_luxury[6],
    pool_restaurant_bar[3], pool_outdoor[1], pool_room_standard[3], pool_spa[1],
  ],
  "Puro Hotel Warsaw Centrum": [
    pool_room_standard[4], pool_room_luxury[0], pool_restaurant_bar[2],
    pool_lobby_grand[4], pool_room_standard[2], pool_restaurant_bar[4],
  ],

  // BARCELONA
  "W Barcelona": [
    pool_outdoor[0], pool_outdoor[4], pool_room_luxury[0],
    pool_restaurant_bar[1], pool_room_luxury[2], pool_spa[0], pool_lobby_grand[3],
  ],
  "Hotel Arts Barcelona": [
    pool_outdoor[1], pool_room_luxury[3], pool_room_luxury[5],
    pool_outdoor[4], pool_restaurant_bar[0], pool_spa[1], pool_room_luxury[1],
  ],
  "Ohla Eixample Hotel": [
    pool_outdoor[2], pool_room_luxury[6], pool_restaurant_bar[2],
    pool_lobby_grand[1], pool_room_luxury[4], pool_room_standard[3],
  ],

  // AMSTERDAM
  "Waldorf Astoria Amsterdam": [
    pool_lobby_grand[0], pool_room_luxury[0], pool_room_luxury[3],
    pool_spa[0], pool_restaurant_bar[0], pool_room_luxury[5], pool_lobby_grand[2],
  ],
  "Hotel V Nesplein": [
    pool_room_standard[0], pool_restaurant_bar[3], pool_lobby_grand[4],
    pool_room_standard[4], pool_room_standard[2], pool_restaurant_bar[4],
  ],

  // VIENNA
  "Park Hyatt Vienna": [
    pool_lobby_grand[0], pool_room_luxury[1], pool_room_luxury[4],
    pool_spa[0], pool_restaurant_bar[0], pool_outdoor[2], pool_room_luxury[6],
  ],
  "Hotel Sacher Wien": [
    pool_lobby_grand[1], pool_room_luxury[0], pool_room_luxury[2],
    pool_restaurant_bar[4], pool_spa[1], pool_room_luxury[5], pool_lobby_grand[4],
  ],

  // DUBAI
  "Atlantis The Palm Dubai": [
    pool_outdoor[0], pool_outdoor[4], pool_outdoor[1],
    pool_room_luxury[0], pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[2],
  ],
  "Burj Al Arab Jumeirah": [
    pool_lobby_grand[0], pool_room_luxury[3], pool_room_luxury[5],
    pool_outdoor[0], pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[1],
  ],
  "Address Downtown Dubai": [
    pool_outdoor[2], pool_room_luxury[0], pool_room_luxury[4],
    pool_restaurant_bar[1], pool_spa[2], pool_room_luxury[6], pool_lobby_grand[3],
  ],

  // ROME
  "Hotel Hassler Roma": [
    pool_lobby_grand[2], pool_room_luxury[0], pool_room_luxury[5],
    pool_restaurant_bar[0], pool_spa[1], pool_room_luxury[3], pool_lobby_grand[0],
  ],
  "Palazzo Manfredi Roma": [
    pool_lobby_grand[1], pool_room_luxury[1], pool_restaurant_bar[4],
    pool_room_luxury[6], pool_spa[0], pool_room_luxury[4],
  ],

  // MADRID
  "Mandarin Oriental Ritz Madrid": [
    pool_lobby_grand[0], pool_room_luxury[2], pool_room_luxury[0],
    pool_outdoor[2], pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[5],
  ],

  // ATHENS
  "Hotel Grande Bretagne Athens": [
    pool_lobby_grand[0], pool_outdoor[0], pool_room_luxury[1],
    pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[3], pool_room_luxury[6],
  ],

  // DOHA
  "St. Regis Doha": [
    pool_outdoor[4], pool_outdoor[0], pool_room_luxury[0],
    pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[2], pool_lobby_grand[2],
  ],

  // PRAGUE
  "Augustine Prague": [
    pool_lobby_grand[1], pool_room_luxury[0], pool_room_luxury[5],
    pool_restaurant_bar[4], pool_spa[2], pool_room_luxury[3], pool_lobby_grand[4],
  ],

  // BUDAPEST
  "New York Palace Budapest": [
    pool_lobby_grand[0], pool_room_luxury[1], pool_restaurant_bar[0],
    pool_room_luxury[4], pool_spa[0], pool_room_luxury[2], pool_lobby_grand[2],
  ],

  // ZURICH
  "Baur au Lac Zurich": [
    pool_lobby_grand[2], pool_room_luxury[0], pool_room_luxury[3],
    pool_restaurant_bar[0], pool_outdoor[3], pool_spa[1], pool_room_luxury[5],
  ],

  // LISBON
  "Bairro Alto Hotel Lisboa": [
    pool_lobby_grand[1], pool_room_luxury[2], pool_room_luxury[6],
    pool_restaurant_bar[1], pool_spa[0], pool_room_luxury[4], pool_outdoor[2],
  ],

  // MILAN
  "Bulgari Hotel Milano": [
    pool_lobby_grand[0], pool_outdoor[0], pool_room_luxury[0],
    pool_spa[0], pool_restaurant_bar[0], pool_room_luxury[3], pool_room_luxury[5],
  ],

  // COPENHAGEN
  "Nimb Hotel Copenhagen": [
    pool_lobby_grand[1], pool_room_luxury[1], pool_restaurant_bar[4],
    pool_spa[2], pool_room_luxury[4], pool_room_luxury[6],
  ],

  // STOCKHOLM
  "Grand Hôtel Stockholm": [
    pool_lobby_grand[2], pool_room_luxury[0], pool_room_luxury[5],
    pool_outdoor[3], pool_restaurant_bar[0], pool_spa[1], pool_lobby_grand[0],
  ],

  // GENEVA
  "Hôtel Beau-Rivage Geneva": [
    pool_lobby_grand[0], pool_room_luxury[2], pool_room_luxury[4],
    pool_outdoor[3], pool_restaurant_bar[4], pool_spa[0], pool_room_luxury[1],
  ],

  // BRUSSELS
  "Hotel Amigo Brussels": [
    pool_lobby_grand[3], pool_room_luxury[0], pool_room_luxury[5],
    pool_restaurant_bar[0], pool_spa[1], pool_room_luxury[3], pool_room_luxury[6],
  ],

  // MUNICH
  "Bayerischer Hof Munich": [
    pool_lobby_grand[0], pool_room_luxury[1], pool_room_luxury[4],
    pool_outdoor[1], pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[2],
  ],

  // DUBLIN
  "The Merrion Hotel Dublin": [
    pool_lobby_grand[1], pool_outdoor[3], pool_room_luxury[0],
    pool_room_luxury[5], pool_restaurant_bar[0], pool_spa[0], pool_room_luxury[3],
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🖼️  Updating hotel images…\n");

  let updated = 0;
  let skipped = 0;

  for (const [name, imageUrls] of Object.entries(hotelImages)) {
    const hotel = await prisma.hotel.findFirst({ where: { name } });
    if (!hotel) {
      console.log(`  ⚠️  Not found: ${name}`);
      skipped++;
      continue;
    }

    await prisma.hotel.update({
      where: { id: hotel.id },
      data:  { imageUrls },
    });

    // Also update rooms of this hotel to use first 2 hotel images
    await prisma.room.updateMany({
      where: { hotelId: hotel.id },
      data:  { imageUrls: imageUrls.slice(0, 2) },
    });

    console.log(`  ✓  ${name} → ${imageUrls.length} images`);
    updated++;
  }

  console.log(`\n✅ Done: ${updated} updated, ${skipped} skipped`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
