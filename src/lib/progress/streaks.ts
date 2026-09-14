function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function calculateLongestStreakDays(dateValues: string[]) {
  const dates = Array.from(new Set(dateValues.map((value) => toDateKey(new Date(value))))).sort();

  if (dates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T00:00:00.000Z`);
    const next = new Date(`${dates[index]}T00:00:00.000Z`);
    const dayDifference = Math.round((next.getTime() - previous.getTime()) / 86_400_000);

    if (dayDifference === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (dayDifference > 1) {
      current = 1;
    }
  }

  return longest;
}
