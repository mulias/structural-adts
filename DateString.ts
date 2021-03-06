import * as Maybe from "./Maybe";
import * as ValidDate from "./ValidDate";

export {
  // Types
  DateString,
  T,
  // Constructors
  DateTimeString,
  DateOnlyString,
  DateMonthString,
  // Typeguards
  isDateString,
  isDateTimeString,
  isDateOnlyString,
  isDateMonthString,
  // Conversions
  toDate,
  // Operations
  map
};

//
// Types
//

/**
 * A string encoding of a Date, guaranteed to parse to a valid Date object. The
 * three encodings provided store date information at different levels of
 * specificity, but are not mutually exclusive. For example, a `DateOnlyString`
 * is a valid `DateTimeString`, but with the time value zeroed out.
 */
type DateString = DateTimeString | DateOnlyString | DateMonthString;

/** Alias for the `DateString` type */
type T = DateString;

/**
 * String encoding of a Year-Month-Day-Time date. Values of this type can be
 * constructed with the `DateTimeString` function.
 */
type DateTimeString = string & IsDateTimeString;
enum IsDateTimeString {
  _ = "DATE_TIME_STRING"
}

/**
 * String encoding of a Year/Month/Day date. When parsed as a Date the time
 * defaults to 00:00:00. Values of this type can be constructed with the
 * `DateOnlyString` function.
 */
type DateOnlyString = string & IsDateOnlyString;
enum IsDateOnlyString {
  _ = "DATE_ONLY_STRING"
}

/**
 * String encoding of a Year-Month date. When parsed as a Date the day
 * defaults to the first of the month, and time to 00:00:00. Values of this
 * type can be constructed with the `DateMonthString` function.
 */
type DateMonthString = string & IsDateMonthString;
enum IsDateMonthString {
  _ = "DATE_MONTH_STRING"
}

type AllDates<A extends Array<any>> = { [k in keyof A]: Date };
type AllValidDates<A extends Array<any>> = { [k in keyof A]: ValidDate.T };

//
// Constructors
//

/**
 * Create a DateTimeString from an input that might encode a Date. If the input
 * is a `DateString` or `ValidDate`, then the return type is `DateTimeString`.
 * Otherwise the return type is `Maybe<DateTimeString>`.
 */
function DateTimeString<D extends DateString | ValidDate.T>(d: D): DateTimeString;
function DateTimeString<D extends Date | string | number>(d: D): Maybe.T<DateTimeString>;
function DateTimeString(d: DateString | ValidDate.T | Date | string | number) {
  if (d instanceof Date && !ValidDate.isValidDate(d)) return undefined;

  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  return date.toISOString();
}

/**
 * Create a DateOnlyString from an input that might encode a Date. If the input
 * is a `DateString` or `ValidDate`, then the return type is `DateOnlyString`.
 * Otherwise the return type is `Maybe<DateOnlyString>`.
 */
function DateOnlyString<D extends DateString | ValidDate.T>(d: D): DateOnlyString;
function DateOnlyString<D extends Date | string | number>(d: D): Maybe.T<DateOnlyString>;
function DateOnlyString(d: DateString | ValidDate.T | Date | string | number) {
  if (d instanceof Date && !ValidDate.isValidDate(d)) return undefined;

  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}T00:00:00Z`;
}

/**
 * Create a DateMonthString from an input that might encode a Date. If the input
 * is a `DateString` or `ValidDate`, then the return type is `DateMonthString`.
 * Otherwise the return type is `Maybe<DateMonthString>`.
 */
function DateMonthString<D extends DateString | ValidDate.T>(d: D): DateMonthString;
function DateMonthString<D extends Date | string | number>(d: D): Maybe.T<DateMonthString>;
function DateMonthString(d: DateString | ValidDate.T | Date | string | number) {
  if (d instanceof Date && !ValidDate.isValidDate(d)) return undefined;

  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  return `${year}-${month}-01T00:00:00Z`;
}

//
// Typeguards
//

/** Typeguard for any string that parses to a valid Date. */
const isDateString = (d: unknown): d is DateString => isDateTimeString(d);

/** Typeguard for any string that parses to a valid Date. */
const isDateTimeString = (d: unknown): d is DateTimeString => {
  if (typeof d !== "string") return false;
  const dateTime = new Date(d).getTime();
  return dateTime !== NaN;
};

/**
 * Typeguard for any string that parses to a valid Date where the time is
 * 00:00:00.
 */
const isDateOnlyString = (d: unknown): d is DateOnlyString => {
  if (typeof d !== "string") return false;
  const dateTime = new Date(d).getTime();
  return dateTime !== NaN && dateTime % 100000 === 0;
};

/**
 * Typeguard for any string that parses to a valid Date where the time is
 * 00:00:00 and the day is the first of the month.
 */
const isDateMonthString = (d: unknown): d is DateMonthString => {
  if (typeof d !== "string") return false;
  const date = new Date(d);
  const dateTime = date.getTime();
  return dateTime !== NaN && dateTime % 100000 === 0 && date.getDate() === 1;
};

//
// Conversions
//

/**
 * Parse a `DateString` into a `Date` object. Because the result is guaranteed
 * to be valid, we return a `ValidDate` type.
 */
const toDate = (d: DateString): ValidDate.T => new Date(d) as ValidDate.T;

//
// Operations
//

/**
 * Apply a `Date` object operation onto one or more `DateString`s, returning a
 * new `DateString`. If `fn` produces a `DateString`, return that value. If
 * `fn` produces a `Date`, convert it to a `DateTimeString`. If `fn` produces
 * an invalid `Date`, return `Maybe.Nothing`.
 */
function map<Args extends Array<DateString>, R extends DateString>(
  fn: (...dates: AllDates<Args>) => R,
  ...dateStringArgs: Args
): R;
function map<Args extends Array<DateString>>(
  fn: (...dates: AllDates<Args>) => ValidDate.T,
  ...dateStringArgs: Args
): DateTimeString;
function map<Args extends Array<DateString>>(
  fn: (...dates: AllDates<Args>) => Date,
  ...dateStringArgs: Args
): Maybe.T<DateTimeString>;
function map<Args extends Array<DateString>>(
  fn: (...dates: AllDates<Args>) => Date | DateString,
  ...dateStringArgs: Args
) {
  const r = fn(...(dateStringArgs.map(toDate) as any));
  if (isDateString(r)) {
    return r;
  } else {
    return DateTimeString(r);
  }
}

/**
 * Apply a `Date` operation to one or more `DateString`s. Unlike `map`, the
 * result of applying `fn` might not be a new `DateString`.
 */
function applyAsDate<Args extends Array<DateString | ValidDate.T>, R>(
  fn: (...dates: AllValidDates<Args>) => R,
  ...dateStringArgs: Args
): R;
function applyAsDate<Args extends Array<DateString | Date>, R>(
  fn: (...dates: AllDates<Args>) => R,
  ...dateStringArgs: Args
): R;
function applyAsDate<Args extends Array<DateString | Date>>(
  fn: (...dates: Args) => any,
  ...dateStringArgs: Args
) {
  const dates = dateStringArgs.map((d) => (d instanceof Date ? d : toDate(d)));
  return fn(...(dates as any));
}
