import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// One row per Telegram chat that has run /start.
export const chats = sqliteTable('chats', {
  chatId: integer('chat_id').primaryKey(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// A vehicle belongs to one chat; a chat may have several vehicles.
export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.chatId, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  currentMileage: integer('current_mileage').notNull().default(0),
  mileageUpdatedAt: text('mileage_updated_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Global catalog of maintenance types with default intervals, seeded lazily.
export const maintenanceTypes = sqliteTable('maintenance_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  defaultMileageInterval: integer('default_mileage_interval'),
  defaultDaysInterval: integer('default_days_interval'),
});

// Per-vehicle tracking + optional interval overrides for a maintenance type.
export const vehicleMaintenance = sqliteTable(
  'vehicle_maintenance',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    vehicleId: integer('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    maintenanceTypeId: integer('maintenance_type_id')
      .notNull()
      .references(() => maintenanceTypes.id),
    mileageIntervalOverride: integer('mileage_interval_override'),
    daysIntervalOverride: integer('days_interval_override'),
    lastDoneMileage: integer('last_done_mileage'),
    lastDoneDate: text('last_done_date'),
    // Set to today's date once a reminder is sent, so the daily cron doesn't re-send same-day.
    lastRemindedAt: text('last_reminded_at'),
  },
  (table) => ({
    uniqVehicleType: uniqueIndex('uniq_vehicle_maintenance_type').on(
      table.vehicleId,
      table.maintenanceTypeId
    ),
  })
);
