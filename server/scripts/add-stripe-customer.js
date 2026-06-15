import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT UNIQUE;`);
console.log("✅ stripeCustomerId column added");
await client.end();
process.exit(0);
