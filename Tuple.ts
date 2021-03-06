import * as Maybe from "./Maybe";
import * as NonEmptyArray from "./NonEmptyArray";

export {
  // Types
  Tuple,
  T,
  // Constructors
  Empty,
  Single,
  Pair,
  Triple,
  // Typeguards
  isEmpty,
  isSingle,
  isPair,
  isTriple,
  // Conversions
  fromElements,
  fromArray,
  // Operations
  first,
  second,
  third,
  head,
  tail,
  last,
  front,
  map,
  mapFirst,
  mapSecond,
  mapThird,
  reverse,
  zip,
  unzip
};

//
// Types
//

/**
 * A `Tuple` is an immutable `Array` with a fixed length. For simplicity we
 * provide utilities for tuples of length 0, 1, 2, and 3, although TypeScript
 * has basic support for larger tuples.
 */
type Tuple<A, B, C> = Empty | Single<A> | Pair<A, B> | Triple<A, B, C>;

/** Alias for the `Tuple` type. */
type T<A, B, C> = Tuple<A, B, C>;

/** An array with no elements, also called a 0-tuple. */
type Empty = readonly [];

/** An array with one element, also called a 1-tuple. */
type Single<A> = readonly [A];

/** An array with two elements, also called a 2-tuple. */
type Pair<A, B> = readonly [A, B];

/** An array with three elements, also called a 3-tuple. */
type Triple<A, B, C> = readonly [A, B, C];

type MappedType<T, A> = { [k in keyof T]: A };

//
// Constructors
//

/** A constructor for the `Empty` tuple, which has no elements. */
const Empty = [] as const;

/** A constructor for the `Single` tuple, which has one element. */
const Single = <A>(a: A): Single<A> => [a];

/** A constructor for the `Pair` tuple, which has two elements. */
const Pair = <A, B>(a: A, b: B): Pair<A, B> => [a, b];

/** A constructor for the `Triple` tuple, which has three elements. */
const Triple = <A, B, C>(a: A, b: B, c: C): Triple<A, B, C> => [a, b, c];

//
// Typeguards
//

/** Typeguard for the `Empty` tuple. */
function isEmpty(arr: Empty): arr is Empty;
function isEmpty<A>(arr: readonly A[]): arr is Empty;
function isEmpty(arr: readonly any[]) {
  return arr.length === 0;
}

/** Typeguard for the `Single` tuple. */
function isSingle<Tup extends Single<any>>(arr: Tup): arr is Tup;
function isSingle<A>(arr: readonly A[]): arr is Single<A>;
function isSingle(arr: readonly any[]) {
  return arr.length === 1;
}

/** Typeguard for the `Pair` tuple. */
function isPair<P extends Pair<any, any>>(arr: P): arr is P;
function isPair<A>(arr: readonly A[]): arr is Pair<A, A>;
function isPair(arr: readonly any[]) {
  return arr.length === 2;
}

/** Typeguard for the `Triple` tuple. */
function isTriple<Tup extends Triple<any, any, any>>(arr: Tup): arr is Tup;
function isTriple<A>(arr: readonly A[]): arr is Triple<A, A, A>;
function isTriple(arr: readonly any[]) {
  return arr.length === 3;
}

//
// Conversions
//

/** Create a `Tuple` from the zero to three provided arguments. */
function fromElements(): Empty;
function fromElements<A>(a: A): Single<A>;
function fromElements<A, B>(a: A, b: B): Pair<A, B>;
function fromElements<A, B, C>(a: A, b: B, c: C): Triple<A, B, C>;
function fromElements<Args extends Tuple<any, any, any>>(...args: Args) {
  return args;
}

/**
 * Return `a` as a `Tuple` of the appropriate length, or return
 * `Maybe.Nothing` if `a.length` is not the correct tuple length.
 */
function fromArray(length: 0, a: Empty): Empty;
function fromArray<A>(length: 0, a: readonly A[]): Maybe.T<Empty>;
function fromArray<Tup extends Single<any>>(size: 1, a: Tup): Tup;
function fromArray<A>(length: 1, a: readonly A[]): Maybe.T<Single<A>>;
function fromArray<Tup extends Pair<any, any>>(size: 2, a: Tup): Tup;
function fromArray<A>(length: 2, a: readonly A[]): Maybe.T<Pair<A, A>>;
function fromArray<Tup extends Triple<any, any, any>>(size: 3, a: Tup): Tup;
function fromArray<A>(length: 3, a: readonly A[]): Maybe.T<Triple<A, A, A>>;
function fromArray(length: number, a: readonly any[]) {
  return a.length === length ? a : Maybe.Nothing;
}

//
// Operations
//

/** Get the first element from a 1/2/3-tuple. */
const first = <A>(t: Single<A> | Pair<A, any> | Triple<A, any, any>): A => t[0];

/** Get the second element from a 2/3-tuple. */
const second = <B>(t: Pair<any, B> | Triple<any, B, any>): B => t[1];

/** Get the third element from a 3-tuple. */
const third = <C>(t: Triple<any, any, C>): C => t[2];

const head = first;

function tail(t: Single<any>): Empty;
function tail<B>(t: Pair<any, B>): Single<B>;
function tail<B, C>(t: Triple<any, B, C>): Pair<B, C>;
function tail([h, ...t]: Single<any> | Pair<any, any> | Triple<any, any, any>) {
  return t;
}

const last = <A>(t: Single<A> | Pair<any, A> | Triple<any, any, A>) => t[t.length - 1];

function front(t: Single<any>): Empty;
function front<A>(t: Pair<A, any>): Single<A>;
function front<A, B>(t: Triple<A, B, any>): Pair<A, B>;
function front(t: Single<any> | Pair<any, any> | Triple<any, any, any>) {
  return t.slice(0, t.length - 1) as any;
}

/**
 * Apply `fn` to each element in the `Tuple`. Unlike
 * `Array.prototype.map`, this function preserves the tuple length,
 * instead of returning an `Array`.
 */
function map(fn: (value: never, index?: never, tup?: Empty) => Empty, t: Empty): Empty;
function map<A, D>(fn: (value: A, index?: 1, tup?: Single<A>) => D, t: Single<A>): Single<D>;
function map<A, B, D>(
  fn: (value: A | B, index?: 1 | 2, tup?: Pair<A, B>) => D,
  t: Pair<A, B>
): Pair<D, D>;
function map<A, B, C, D>(
  fn: (value: A | B | C, index?: 1 | 2 | 3, tup?: Triple<A, B, C>) => D,
  t: Triple<A, B, C>
): Triple<D, D, D>;
function map(fn: any, t: any) {
  return t.map(fn);
}

/**
 * Apply `fn` to the first element in a 1/2/3-tuple, producing a new `Tuple`
 * with any other element unchanged.
 */
function mapFirst<A, R>(fn: (a: A) => R, t: Single<A>): Single<R>;
function mapFirst<A, B, R>(fn: (a: A) => R, t: Pair<A, B>): Pair<R, B>;
function mapFirst<A, B, C, R>(fn: (a: A) => R, t: Triple<A, B, C>): Triple<R, B, C>;
function mapFirst<A, Tup extends Single<A> | Pair<A, any> | Triple<A, any, any>>(
  fn: (a: A) => any,
  [a, ...rest]: Tup
) {
  return [fn(a), ...rest] as any;
}

/**
 * Apply `fn` to the second element in a 2/3-tuple, producing a new `Tuple` with
 * the other elements unchanged;
 */
function mapSecond<A, B, R>(fn: (b: B) => R, t: Pair<A, B>): Pair<A, R>;
function mapSecond<A, B, C, R>(fn: (b: B) => R, t: Triple<A, B, C>): Triple<A, R, C>;
function mapSecond<B, Tup extends Pair<any, B> | Triple<any, B, any>>(
  fn: (b: B) => any,
  [a, b, ...rest]: Tup
) {
  return [a, fn(b), ...rest] as any;
}

/**
 * Apply `fn` to the third element in a 3-tuple, producing a new `Tuple` with
 * the other elements unchanged;
 */
function mapThird<A, B, C, R>(fn: (c: C) => R, [a, b, c]: Triple<A, B, C>): Triple<A, B, R> {
  return [a, b, fn(c)];
}

/** Reverse the order of a `Tuple`, returning a shallow copy. */
function reverse(t: Empty): Empty;
function reverse<A>(t: Single<A>): Single<A>;
function reverse<A, B>(t: Pair<A, B>): Pair<A, B>;
function reverse<A, B, C>(t: Triple<A, B, C>): Triple<A, B, C>;
function reverse<Tup extends any[]>(t: Tup) {
  return [...t].reverse() as any;
}

/** Combine one to three arrays into one array of 1/2/3-tuples. */
function zip<A>(a: NonEmptyArray.T<A>): NonEmptyArray.T<Single<A>>;
function zip<A>(a: readonly A[]): Array<Single<A>>;
function zip<A, B>(a: NonEmptyArray.T<A>, b: NonEmptyArray.T<B>): NonEmptyArray.T<Pair<A, B>>;
function zip<A, B>(a: readonly A[], b: readonly B[]): Array<Pair<A, B>>;
function zip<A, B, C>(
  a: NonEmptyArray.T<A>,
  b: NonEmptyArray.T<B>,
  c: NonEmptyArray.T<C>
): NonEmptyArray.T<Triple<A, B, C>>;
function zip<A, B, C>(a: readonly A[], b: readonly B[], c: readonly C[]): Array<Triple<A, B, C>>;
function zip(a: readonly any[], b?: readonly any[], c?: readonly any[]) {
  const res = [];

  if (b !== undefined && c !== undefined) {
    const len = Math.min(a.length, b.length, c.length);
    for (let i = 0; i < len; i++) {
      res[i] = [a[i], b[i], c[i]];
    }
  } else if (b !== undefined) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      res[i] = [a[i], b[i]];
    }
  } else {
    const len = a.length;
    for (let i = 0; i < len; i++) {
      res[i] = [a[i]];
    }
  }

  return res as any;
}

/** Extract one to three arrays from an array of 1/2/3-tuples. */
function unzip<A>(zipped: NonEmptyArray.T<Single<A>>): Single<NonEmptyArray.T<A>>;
function unzip<A>(zipped: ReadonlyArray<Single<A>>): Single<A[]>;
function unzip<A, B>(
  zipped: NonEmptyArray.T<Pair<A, B>>
): Pair<NonEmptyArray.T<A>, NonEmptyArray.T<B>>;
function unzip<A, B>(zipped: ReadonlyArray<Pair<A, B>>): Pair<A[], B[]>;
function unzip<A, B, C>(
  zipped: NonEmptyArray.T<Triple<A, B, C>>
): Triple<NonEmptyArray.T<A>, NonEmptyArray.T<B>, NonEmptyArray.T<C>>;
function unzip<A, B, C>(zipped: ReadonlyArray<Triple<A, B, C>>): Triple<A[], B[], C[]>;
function unzip<Tup extends Single<any> | Pair<any, any> | Triple<any, any, any>>([
  firstTuple,
  ...rest
]: ReadonlyArray<Tup>) {
  const resTups = firstTuple.map((x) => [x]);

  rest.forEach((nextTup) =>
    resTups.forEach((resElem, resElemIndex) => {
      console.log(resElem);
      resElem.push(nextTup[resElemIndex]);
    })
  );

  return resTups as any;
}
