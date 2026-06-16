export interface MaintenanceTypeDefaults {
  key: string;
  label: string;
  defaultMileageInterval: number | null;
  defaultDaysInterval: number | null;
}

export const DEFAULT_MAINTENANCE_TYPES: MaintenanceTypeDefaults[] = [
  { key: 'oil_change', label: 'Oil Change', defaultMileageInterval: 5000, defaultDaysInterval: 180 },
  { key: 'tire_rotation', label: 'Tire Rotation', defaultMileageInterval: 6000, defaultDaysInterval: 180 },
  { key: 'brake_pads', label: 'Brake Pads', defaultMileageInterval: 25000, defaultDaysInterval: 365 },
  { key: 'registration', label: 'Registration Renewal', defaultMileageInterval: null, defaultDaysInterval: 365 },
  { key: 'insurance', label: 'Insurance Renewal', defaultMileageInterval: null, defaultDaysInterval: 180 },
  { key: 'air_filter', label: 'Air Filter', defaultMileageInterval: 12000, defaultDaysInterval: 365 },
];

export interface DueStatus {
  isDue: boolean;
  trigger: 'mileage' | 'date' | null;
  mileageDue: number | null;
  dateDue: string | null;
  milesRemaining: number | null;
  daysRemaining: number | null;
}

export function computeDueStatus(params: {
  currentMileage: number;
  today: string;
  lastDoneMileage: number | null;
  lastDoneDate: string | null;
  mileageInterval: number | null;
  daysInterval: number | null;
}): DueStatus {
  const { currentMileage, today, lastDoneMileage, lastDoneDate, mileageInterval, daysInterval } = params;

  const mileageDue =
    lastDoneMileage != null && mileageInterval != null ? lastDoneMileage + mileageInterval : null;
  const dateDue = lastDoneDate != null && daysInterval != null ? addDays(lastDoneDate, daysInterval) : null;

  const milesRemaining = mileageDue != null ? mileageDue - currentMileage : null;
  const daysRemaining = dateDue != null ? daysBetween(today, dateDue) : null;

  const mileageHit = mileageDue != null && currentMileage >= mileageDue;
  const dateHit = dateDue != null && today >= dateDue;

  let trigger: 'mileage' | 'date' | null = null;
  if (mileageHit) trigger = 'mileage';
  else if (dateHit) trigger = 'date';

  return {
    isDue: mileageHit || dateHit,
    trigger,
    mileageDue,
    dateDue,
    milesRemaining,
    daysRemaining,
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00Z`).getTime();
  const to = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}
