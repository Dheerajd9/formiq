import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/bot/client';
import { maintenanceTypes, vehicleMaintenance, vehicles } from '../../db/bot/schema';
import { computeDueStatus, todayIso } from '../../lib/bot/maintenance';
import { sendMessage } from '../../lib/telegram';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).end();
    return;
  }

  const db = getDb();
  const today = todayIso();

  const rows = await db
    .select({
      vmId: vehicleMaintenance.id,
      chatId: vehicles.chatId,
      vehicleName: vehicles.name,
      currentMileage: vehicles.currentMileage,
      typeLabel: maintenanceTypes.label,
      defaultMileageInterval: maintenanceTypes.defaultMileageInterval,
      defaultDaysInterval: maintenanceTypes.defaultDaysInterval,
      mileageIntervalOverride: vehicleMaintenance.mileageIntervalOverride,
      daysIntervalOverride: vehicleMaintenance.daysIntervalOverride,
      lastDoneMileage: vehicleMaintenance.lastDoneMileage,
      lastDoneDate: vehicleMaintenance.lastDoneDate,
      lastRemindedAt: vehicleMaintenance.lastRemindedAt,
    })
    .from(vehicleMaintenance)
    .innerJoin(vehicles, eq(vehicleMaintenance.vehicleId, vehicles.id))
    .innerJoin(maintenanceTypes, eq(vehicleMaintenance.maintenanceTypeId, maintenanceTypes.id));

  const linesByChatId = new Map<number, string[]>();

  for (const row of rows) {
    if (row.lastRemindedAt === today) continue;

    const status = computeDueStatus({
      currentMileage: row.currentMileage,
      today,
      lastDoneMileage: row.lastDoneMileage,
      lastDoneDate: row.lastDoneDate,
      mileageInterval: row.mileageIntervalOverride ?? row.defaultMileageInterval,
      daysInterval: row.daysIntervalOverride ?? row.defaultDaysInterval,
    });

    if (!status.isDue) continue;

    const line =
      status.trigger === 'mileage'
        ? `${row.vehicleName} — ${row.typeLabel}: ${(row.currentMileage - (status.mileageDue ?? 0)).toLocaleString(
            'en-US'
          )} mi overdue`
        : `${row.vehicleName} — ${row.typeLabel}: overdue since ${status.dateDue}`;

    const lines = linesByChatId.get(row.chatId) ?? [];
    lines.push(line);
    linesByChatId.set(row.chatId, lines);

    await db.update(vehicleMaintenance).set({ lastRemindedAt: today }).where(eq(vehicleMaintenance.id, row.vmId));
  }

  let chatsNotified = 0;
  let chatsFailed = 0;
  for (const [chatId, lines] of linesByChatId) {
    try {
      await sendMessage(chatId, `🔧 Maintenance reminders:\n${lines.join('\n')}`);
      chatsNotified++;
    } catch (err) {
      chatsFailed++;
      console.error(`cron failed to notify chat ${chatId}`, err);
    }
  }

  res.status(200).json({ ok: true, chatsNotified, chatsFailed });
}
