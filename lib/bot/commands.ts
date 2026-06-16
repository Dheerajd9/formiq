import { eq } from 'drizzle-orm';
import { getDb } from '../../db/bot/client';
import {
  ensureChat,
  findMaintenanceTypeByKey,
  findVehicleByName,
  getMaintenanceTypes,
  getOrCreateVehicleMaintenance,
  getVehicleMaintenanceWithTypes,
  getVehiclesForChat,
} from '../../db/bot/queries';
import { vehicleMaintenance, vehicles } from '../../db/bot/schema';
import { formatDueList, formatVehicleList, helpText, type DueLine } from './formatting';
import { computeDueStatus, todayIso } from './maintenance';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function routeCommand(chatId: number, text: string): Promise<string> {
  const [rawCmd, ...args] = text.trim().split(/\s+/);
  const cmd = rawCmd.split('@')[0].toLowerCase();

  switch (cmd) {
    case '/start':
      return handleStart(chatId);
    case '/help':
      return helpText();
    case '/addcar':
      return handleAddCar(chatId, args);
    case '/cars':
      return handleCars(chatId);
    case '/mileage':
      return handleMileage(chatId, args);
    case '/logservice':
      return handleLogService(chatId, args);
    case '/due':
      return handleDue(chatId, args);
    case '/setinterval':
      return handleSetInterval(chatId, args);
    case '/types':
      return handleTypes();
    default:
      return `Unknown command.\n\n${helpText()}`;
  }
}

async function handleStart(chatId: number): Promise<string> {
  await ensureChat(chatId);
  return `Welcome! I'll help you track car maintenance and remind you when something's due.\n\n${helpText()}`;
}

async function handleAddCar(chatId: number, args: string[]): Promise<string> {
  const [name, make, model, yearRaw] = args;
  if (!name) {
    return 'Usage: /addcar <name> [make] [model] [year]';
  }

  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;
  const db = getDb();
  await ensureChat(chatId);
  await db.insert(vehicles).values({ chatId, name, make: make ?? null, model: model ?? null, year });

  const details = [make, model, yearRaw].filter(Boolean).join(' ');
  return `Added ${name}${details ? ` (${details})` : ''}.`;
}

async function handleCars(chatId: number): Promise<string> {
  const rows = await getVehiclesForChat(chatId);
  return formatVehicleList(rows);
}

async function handleMileage(chatId: number, args: string[]): Promise<string> {
  const [carName, odometerRaw] = args;
  if (!carName || !odometerRaw) {
    return 'Usage: /mileage <car> <odometer>';
  }

  const odometer = Number(odometerRaw);
  if (!Number.isFinite(odometer) || odometer < 0) {
    return 'Odometer reading must be a non-negative number.';
  }

  const vehicle = await findVehicleByName(chatId, carName);
  if (!vehicle) {
    return `No vehicle named "${carName}". Check /cars.`;
  }

  const db = getDb();
  await db
    .update(vehicles)
    .set({ currentMileage: Math.round(odometer), mileageUpdatedAt: todayIso() })
    .where(eq(vehicles.id, vehicle.id));

  return `Updated ${vehicle.name} to ${Math.round(odometer).toLocaleString('en-US')} mi.`;
}

async function handleLogService(chatId: number, args: string[]): Promise<string> {
  const [carName, typeKey, mileageRaw, dateRaw] = args;
  if (!carName || !typeKey) {
    return 'Usage: /logservice <car> <type> [mileage] [date]';
  }

  const vehicle = await findVehicleByName(chatId, carName);
  if (!vehicle) {
    return `No vehicle named "${carName}". Check /cars.`;
  }

  const type = await findMaintenanceTypeByKey(typeKey);
  if (!type) {
    return `Unknown maintenance type "${typeKey}". Check /types.`;
  }

  let mileage = vehicle.currentMileage;
  if (mileageRaw) {
    const parsed = Number(mileageRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 'Mileage must be a non-negative number.';
    }
    mileage = Math.round(parsed);
  }

  let date = todayIso();
  if (dateRaw) {
    if (!DATE_RE.test(dateRaw)) {
      return 'Date must be in YYYY-MM-DD format.';
    }
    date = dateRaw;
  }

  const tracking = await getOrCreateVehicleMaintenance(vehicle.id, type.id);
  const db = getDb();
  await db
    .update(vehicleMaintenance)
    .set({ lastDoneMileage: mileage, lastDoneDate: date, lastRemindedAt: null })
    .where(eq(vehicleMaintenance.id, tracking.id));

  return `Logged ${type.label} for ${vehicle.name} at ${mileage.toLocaleString('en-US')} mi on ${date}.`;
}

async function handleDue(chatId: number, args: string[]): Promise<string> {
  const [carName] = args;
  let vehicleRows = await getVehiclesForChat(chatId);

  if (carName) {
    const match = vehicleRows.find((v) => v.name.toLowerCase() === carName.toLowerCase());
    if (!match) {
      return `No vehicle named "${carName}". Check /cars.`;
    }
    vehicleRows = [match];
  }

  if (vehicleRows.length === 0) {
    return "You haven't added any vehicles yet. Use /addcar <name> to add one.";
  }

  const today = todayIso();
  const due: DueLine[] = [];
  const upcoming: DueLine[] = [];
  const untracked: { vehicleName: string; typeLabel: string }[] = [];

  for (const vehicle of vehicleRows) {
    const rows = await getVehicleMaintenanceWithTypes(vehicle.id);
    for (const row of rows) {
      if (row.lastDoneMileage == null && row.lastDoneDate == null) {
        untracked.push({ vehicleName: vehicle.name, typeLabel: row.typeLabel });
        continue;
      }

      const status = computeDueStatus({
        currentMileage: vehicle.currentMileage,
        today,
        lastDoneMileage: row.lastDoneMileage,
        lastDoneDate: row.lastDoneDate,
        mileageInterval: row.mileageIntervalOverride ?? row.defaultMileageInterval,
        daysInterval: row.daysIntervalOverride ?? row.defaultDaysInterval,
      });

      const line: DueLine = { vehicleName: vehicle.name, typeLabel: row.typeLabel, status };
      if (status.isDue) due.push(line);
      else upcoming.push(line);
    }
  }

  return formatDueList({ due, upcoming, untracked });
}

async function handleSetInterval(chatId: number, args: string[]): Promise<string> {
  const [carName, typeKey, mileageRaw, daysRaw] = args;
  if (!carName || !typeKey || !mileageRaw || !daysRaw) {
    return 'Usage: /setinterval <car> <type> <mileage|-> <days|->';
  }

  const vehicle = await findVehicleByName(chatId, carName);
  if (!vehicle) {
    return `No vehicle named "${carName}". Check /cars.`;
  }

  const type = await findMaintenanceTypeByKey(typeKey);
  if (!type) {
    return `Unknown maintenance type "${typeKey}". Check /types.`;
  }

  let mileageOverride: number | null = null;
  if (mileageRaw !== '-') {
    const parsed = Number(mileageRaw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 'Mileage interval must be a positive number, or "-" to clear.';
    }
    mileageOverride = Math.round(parsed);
  }

  let daysOverride: number | null = null;
  if (daysRaw !== '-') {
    const parsed = Number(daysRaw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 'Days interval must be a positive number, or "-" to clear.';
    }
    daysOverride = Math.round(parsed);
  }

  const tracking = await getOrCreateVehicleMaintenance(vehicle.id, type.id);
  const db = getDb();
  await db
    .update(vehicleMaintenance)
    .set({ mileageIntervalOverride: mileageOverride, daysIntervalOverride: daysOverride })
    .where(eq(vehicleMaintenance.id, tracking.id));

  const mileageText = mileageOverride != null ? `${mileageOverride.toLocaleString('en-US')} mi` : 'default';
  const daysText = daysOverride != null ? `${daysOverride} days` : 'default';
  return `Set ${type.label} interval for ${vehicle.name}: ${mileageText} / ${daysText}.`;
}

async function handleTypes(): Promise<string> {
  const types = await getMaintenanceTypes();
  return types
    .map((t) => {
      const mileage =
        t.defaultMileageInterval != null ? `${t.defaultMileageInterval.toLocaleString('en-US')} mi` : '–';
      const days = t.defaultDaysInterval != null ? `${t.defaultDaysInterval} days` : '–';
      return `- ${t.key}: ${t.label} (every ${mileage} / ${days})`;
    })
    .join('\n');
}
