import type { DueStatus } from './maintenance';

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatStatusLine(label: string, status: DueStatus): string {
  if (status.isDue) {
    const bits: string[] = [];
    if (status.milesRemaining != null && status.milesRemaining <= 0) {
      bits.push(`${formatNumber(-status.milesRemaining)} mi overdue`);
    }
    if (status.daysRemaining != null && status.daysRemaining <= 0) {
      bits.push(`${-status.daysRemaining} days overdue`);
    }
    return `⚠️ ${label}: ${bits.join(', ')}`;
  }

  const bits: string[] = [];
  if (status.milesRemaining != null) bits.push(`${formatNumber(status.milesRemaining)} mi`);
  if (status.daysRemaining != null) bits.push(`${status.daysRemaining} days`);
  return `${label}: due in ${bits.join(' / ')}`;
}

export function helpText(): string {
  return [
    '*Car Maintenance Bot*',
    '',
    '/addcar <name> [make] [model] [year] — register a vehicle',
    '/cars — list your vehicles',
    '/mileage <car> <odometer> — update current mileage',
    '/logservice <car> <type> [mileage] [date] — record a completed service',
    '/due [car] — show upcoming and overdue maintenance',
    '/setinterval <car> <type> <mileage|-> <days|-> — override intervals for a vehicle',
    '/types — list maintenance type keys',
    '/help — show this message',
  ].join('\n');
}

export function formatVehicleList(
  vehiclesList: {
    name: string;
    make: string | null;
    model: string | null;
    year: number | null;
    currentMileage: number;
    mileageUpdatedAt: string | null;
  }[]
): string {
  if (vehiclesList.length === 0) {
    return "You haven't added any vehicles yet. Use /addcar <name> to add one.";
  }

  return vehiclesList
    .map((v) => {
      const details = [v.make, v.model, v.year].filter(Boolean).join(' ');
      const mileage = `${formatNumber(v.currentMileage)} mi${
        v.mileageUpdatedAt ? ` (as of ${v.mileageUpdatedAt})` : ' (not recorded yet)'
      }`;
      return `- ${v.name}${details ? ` (${details})` : ''}: ${mileage}`;
    })
    .join('\n');
}

export interface DueLine {
  vehicleName: string;
  typeLabel: string;
  status: DueStatus;
}

export function formatDueList(params: {
  due: DueLine[];
  upcoming: DueLine[];
  untracked: { vehicleName: string; typeLabel: string }[];
}): string {
  const { due, upcoming, untracked } = params;

  if (due.length === 0 && upcoming.length === 0 && untracked.length === 0) {
    return 'No maintenance items found. Use /logservice to start tracking one.';
  }

  const sections: string[] = [];

  if (due.length > 0) {
    sections.push(
      ['*Overdue:*', ...due.map((d) => formatStatusLine(`${d.vehicleName} — ${d.typeLabel}`, d.status))].join('\n')
    );
  }

  if (upcoming.length > 0) {
    const sorted = [...upcoming].sort((a, b) => {
      const aScore = a.status.daysRemaining ?? a.status.milesRemaining ?? Infinity;
      const bScore = b.status.daysRemaining ?? b.status.milesRemaining ?? Infinity;
      return aScore - bScore;
    });
    sections.push(
      ['*Upcoming:*', ...sorted.map((u) => formatStatusLine(`${u.vehicleName} — ${u.typeLabel}`, u.status))].join(
        '\n'
      )
    );
  }

  if (untracked.length > 0) {
    sections.push(
      ['*Not tracked yet:*', ...untracked.map((u) => `${u.vehicleName} — ${u.typeLabel}`)].join('\n')
    );
  }

  return sections.join('\n\n');
}
