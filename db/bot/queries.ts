import { and, eq } from 'drizzle-orm';
import { DEFAULT_MAINTENANCE_TYPES } from '../../lib/bot/maintenance';
import { getDb } from './client';
import { chats, maintenanceTypes, vehicleMaintenance, vehicles } from './schema';

export async function ensureChat(chatId: number) {
  const db = getDb();
  await db.insert(chats).values({ chatId }).onConflictDoNothing();
}

export async function ensureMaintenanceTypesSeeded() {
  const db = getDb();
  await db.insert(maintenanceTypes).values(DEFAULT_MAINTENANCE_TYPES).onConflictDoNothing();
}

export async function getMaintenanceTypes() {
  const db = getDb();
  return db.select().from(maintenanceTypes).orderBy(maintenanceTypes.id);
}

export async function findMaintenanceTypeByKey(key: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(maintenanceTypes)
    .where(eq(maintenanceTypes.key, key.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function getVehiclesForChat(chatId: number) {
  const db = getDb();
  return db.select().from(vehicles).where(eq(vehicles.chatId, chatId));
}

export async function findVehicleByName(chatId: number, name: string) {
  const vehiclesInChat = await getVehiclesForChat(chatId);
  return vehiclesInChat.find((v) => v.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export async function getOrCreateVehicleMaintenance(vehicleId: number, maintenanceTypeId: number) {
  const db = getDb();
  const existing = await db
    .select()
    .from(vehicleMaintenance)
    .where(
      and(eq(vehicleMaintenance.vehicleId, vehicleId), eq(vehicleMaintenance.maintenanceTypeId, maintenanceTypeId))
    )
    .limit(1);
  if (existing[0]) return existing[0];

  const created = await db
    .insert(vehicleMaintenance)
    .values({ vehicleId, maintenanceTypeId })
    .returning();
  return created[0];
}

export async function getVehicleMaintenanceWithTypes(vehicleId: number) {
  const db = getDb();
  return db
    .select({
      id: vehicleMaintenance.id,
      typeKey: maintenanceTypes.key,
      typeLabel: maintenanceTypes.label,
      defaultMileageInterval: maintenanceTypes.defaultMileageInterval,
      defaultDaysInterval: maintenanceTypes.defaultDaysInterval,
      mileageIntervalOverride: vehicleMaintenance.mileageIntervalOverride,
      daysIntervalOverride: vehicleMaintenance.daysIntervalOverride,
      lastDoneMileage: vehicleMaintenance.lastDoneMileage,
      lastDoneDate: vehicleMaintenance.lastDoneDate,
    })
    .from(maintenanceTypes)
    .leftJoin(
      vehicleMaintenance,
      and(eq(vehicleMaintenance.maintenanceTypeId, maintenanceTypes.id), eq(vehicleMaintenance.vehicleId, vehicleId))
    );
}
