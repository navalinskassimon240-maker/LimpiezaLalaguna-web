import { siteConfig } from './config';

export interface DaySchedule {
  dayName: string; // 'Lunes', 'Martes', etc.
  dayIndex: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  isOpen: boolean;
  shifts: { open: string; close: string }[]; // e.g. [{ open: '08:30', close: '12:30' }, { open: '16:30', close: '20:30' }]
}

export interface StoreHoursConfig {
  timezone: string;
  schedule: DaySchedule[];
  specialNote?: string;
}

export const defaultStoreHours: StoreHoursConfig = {
  timezone: siteConfig.horarios.zonaHoraria,
  specialNote: siteConfig.horarios.notaEspecial,
  schedule: siteConfig.horarios.dias
};

export interface StoreStatus {
  isOpen: boolean;
  statusText: string;
  subText: string;
  currentDayName: string;
  nextEventText: string;
}

export function getStoreStatus(config: StoreHoursConfig = defaultStoreHours, referenceDate?: Date): StoreStatus {
  const now = referenceDate || new Date();
  
  // Format current day and time
  const currentDayIndex = now.getDay(); // 0-6
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const todayConfig = config.schedule.find(s => s.dayIndex === currentDayIndex) || config.schedule[0];

  if (!todayConfig.isOpen || todayConfig.shifts.length === 0) {
    // Look for next open day
    const nextOpen = findNextOpening(config, currentDayIndex, currentTimeMinutes);
    return {
      isOpen: false,
      statusText: 'Cerrado Ahora',
      subText: 'Hoy estamos cerrados',
      currentDayName: todayConfig.dayName,
      nextEventText: nextOpen
    };
  }

  // Check if currently within any shift
  for (const shift of todayConfig.shifts) {
    const [openH, openM] = shift.open.split(':').map(Number);
    const [closeH, closeM] = shift.close.split(':').map(Number);
    const shiftOpenMinutes = openH * 60 + openM;
    const shiftCloseMinutes = closeH * 60 + closeM;

    if (currentTimeMinutes >= shiftOpenMinutes && currentTimeMinutes < shiftCloseMinutes) {
      return {
        isOpen: true,
        statusText: 'Abierto Ahora',
        subText: `Atendiendo hasta las ${shift.close} hs`,
        currentDayName: todayConfig.dayName,
        nextEventText: `Cierra a las ${shift.close} hs`
      };
    }
  }

  // Not in a shift today
  // Check if there is another shift later today
  const laterShift = todayConfig.shifts.find(s => {
    const [openH, openM] = s.open.split(':').map(Number);
    return (openH * 60 + openM) > currentTimeMinutes;
  });

  if (laterShift) {
    return {
      isOpen: false,
      statusText: 'Cerrado Ahora',
      subText: `Reabre hoy a las ${laterShift.open} hs`,
      currentDayName: todayConfig.dayName,
      nextEventText: `Abre a las ${laterShift.open} hs`
    };
  }

  // No more shifts today, find next opening day
  const nextOpen = findNextOpening(config, currentDayIndex, currentTimeMinutes);
  return {
    isOpen: false,
    statusText: 'Cerrado Ahora',
    subText: 'Por hoy cerramos',
    currentDayName: todayConfig.dayName,
    nextEventText: nextOpen
  };
}

function findNextOpening(config: StoreHoursConfig, fromDayIndex: number, _fromMinutes: number): string {
  for (let offset = 1; offset <= 7; offset++) {
    const checkDayIndex = (fromDayIndex + offset) % 7;
    const day = config.schedule.find(s => s.dayIndex === checkDayIndex);
    if (day && day.isOpen && day.shifts.length > 0) {
      const firstShift = day.shifts[0];
      if (offset === 1) {
        return `Abre mañana a las ${firstShift.open} hs`;
      }
      return `Abre el ${day.dayName} a las ${firstShift.open} hs`;
    }
  }
  return 'Próximamente';
}
