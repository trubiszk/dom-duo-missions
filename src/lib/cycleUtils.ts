import { differenceInDays } from 'date-fns';

export interface CyclePhase {
  phase: string;
  dayOfCycle: number;
  tip: string;
  emoji: string;
}

export const calculateCyclePhase = (
  lastPeriodStart: string | null,
  cycleLength: number = 28
): CyclePhase | null => {
  if (!lastPeriodStart) {
    return null;
  }

  const today = new Date();
  const periodStartDate = new Date(lastPeriodStart);
  const daysSinceStart = differenceInDays(today, periodStartDate);
  const dayOfCycle = (daysSinceStart % cycleLength) + 1;

  // Phase 1: Menstruacja (dni 1-5)
  if (dayOfCycle >= 1 && dayOfCycle <= 5) {
    return {
      phase: 'Menstruacja',
      dayOfCycle,
      tip: 'To czas, kiedy wiele osób może mieć mniej energii lub większą wrażliwość. To nie diagnoza – po prostu warto być delikatniejszym.',
      emoji: '🌸'
    };
  }

  // Phase 2: Faza folikularna (dni 6-13)
  if (dayOfCycle >= 6 && dayOfCycle <= 13) {
    return {
      phase: 'Faza folikularna',
      dayOfCycle,
      tip: 'Czas rosnącej energii i dobrego samopoczucia dla wielu osób.',
      emoji: '☀️'
    };
  }

  // Phase 3: Owulacja (dni 14-16)
  if (dayOfCycle >= 14 && dayOfCycle <= 16) {
    return {
      phase: 'Owulacja',
      dayOfCycle,
      tip: 'Zazwyczaj czas szczytowej energii i pewności siebie.',
      emoji: '✨'
    };
  }

  // Phase 4: Przed okresem (dni 25-28 lub ostatnie 4 dni cyklu)
  if (dayOfCycle >= cycleLength - 3) {
    return {
      phase: 'Przed okresem',
      dayOfCycle,
      tip: 'W tym czasie mogą pojawić się zmiany nastroju lub większa wrażliwość. Warto być cierpliwym i wspierającym.',
      emoji: '🌙'
    };
  }

  // Phase 5: Faza lutealna (pozostałe dni)
  return {
    phase: 'Faza lutealna',
    dayOfCycle,
    tip: 'Czas stabilizacji po owulacji. Energia może być średnia.',
    emoji: '🌿'
  };
};
