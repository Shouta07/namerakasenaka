// Local declaration shim for `date-fns` (v4).
//
// The installed `date-fns@4.x` package's `exports` map references `.d.ts`
// files that are not actually present in this install. To keep the project
// building with TypeScript strict mode (and avoid pulling a network dep just
// for types), we declare the small surface the app uses.
declare module "date-fns" {
  export function addDays(date: Date | number, amount: number): Date;
  export function startOfMonth(date: Date | number): Date;
  export function endOfMonth(date: Date | number): Date;
  export function startOfWeek(
    date: Date | number,
    options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
  ): Date;
  export function isSameDay(left: Date | number, right: Date | number): boolean;
  export function isSameMonth(left: Date | number, right: Date | number): boolean;
  export function format(
    date: Date | number,
    formatStr: string,
    options?: Record<string, unknown>,
  ): string;
}
