import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { Booking } from "../entities/Booking";
import { BookingStatusHistory } from "../entities/BookingStatusHistory";
import { Payment } from "../entities/Payment";
import { SavedAddress } from "../entities/SavedAddress";
import { ServiceCatalog } from "../entities/ServiceCatalog";
import { ServiceCategory } from "../entities/ServiceCategory";
import { StaffMember } from "../entities/StaffMember";
import { User } from "../entities/User";

const sharedOptions = {
  entities: [
    User,
    Booking,
    BookingStatusHistory,
    Payment,
    SavedAddress,
    ServiceCatalog,
    ServiceCategory,
    StaffMember,
  ],
  synchronize: env.DB_SYNCHRONIZE,
  logging: false,
};

export const AppDataSource =
  env.DATABASE_DRIVER === "postgres"
    ? new DataSource({
        type: "postgres",
        url: env.DATABASE_URL,
        ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
        extra: {
          max: 5, // Limit connections to avoid (EMAXCONNSESSION)
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
        },
        ...sharedOptions,
      })
    : new DataSource({
        type: "sqlite",
        database: env.DATABASE_SQLITE_PATH,
        ...sharedOptions,
      });
