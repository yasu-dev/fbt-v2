
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model DeliveryPlanProduct
 * 
 */
export type DeliveryPlanProduct = $Result.DefaultSelection<Prisma.$DeliveryPlanProductPayload>
/**
 * Model HierarchicalInspectionChecklist
 * 
 */
export type HierarchicalInspectionChecklist = $Result.DefaultSelection<Prisma.$HierarchicalInspectionChecklistPayload>
/**
 * Model HierarchicalInspectionResponse
 * 
 */
export type HierarchicalInspectionResponse = $Result.DefaultSelection<Prisma.$HierarchicalInspectionResponsePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs>;

  /**
   * `prisma.deliveryPlanProduct`: Exposes CRUD operations for the **DeliveryPlanProduct** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeliveryPlanProducts
    * const deliveryPlanProducts = await prisma.deliveryPlanProduct.findMany()
    * ```
    */
  get deliveryPlanProduct(): Prisma.DeliveryPlanProductDelegate<ExtArgs>;

  /**
   * `prisma.hierarchicalInspectionChecklist`: Exposes CRUD operations for the **HierarchicalInspectionChecklist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HierarchicalInspectionChecklists
    * const hierarchicalInspectionChecklists = await prisma.hierarchicalInspectionChecklist.findMany()
    * ```
    */
  get hierarchicalInspectionChecklist(): Prisma.HierarchicalInspectionChecklistDelegate<ExtArgs>;

  /**
   * `prisma.hierarchicalInspectionResponse`: Exposes CRUD operations for the **HierarchicalInspectionResponse** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HierarchicalInspectionResponses
    * const hierarchicalInspectionResponses = await prisma.hierarchicalInspectionResponse.findMany()
    * ```
    */
  get hierarchicalInspectionResponse(): Prisma.HierarchicalInspectionResponseDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Product: 'Product',
    DeliveryPlanProduct: 'DeliveryPlanProduct',
    HierarchicalInspectionChecklist: 'HierarchicalInspectionChecklist',
    HierarchicalInspectionResponse: 'HierarchicalInspectionResponse'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "product" | "deliveryPlanProduct" | "hierarchicalInspectionChecklist" | "hierarchicalInspectionResponse"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      DeliveryPlanProduct: {
        payload: Prisma.$DeliveryPlanProductPayload<ExtArgs>
        fields: Prisma.DeliveryPlanProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeliveryPlanProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeliveryPlanProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>
          }
          findFirst: {
            args: Prisma.DeliveryPlanProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeliveryPlanProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>
          }
          findMany: {
            args: Prisma.DeliveryPlanProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>[]
          }
          create: {
            args: Prisma.DeliveryPlanProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>
          }
          createMany: {
            args: Prisma.DeliveryPlanProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeliveryPlanProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>[]
          }
          delete: {
            args: Prisma.DeliveryPlanProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>
          }
          update: {
            args: Prisma.DeliveryPlanProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>
          }
          deleteMany: {
            args: Prisma.DeliveryPlanProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeliveryPlanProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DeliveryPlanProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPlanProductPayload>
          }
          aggregate: {
            args: Prisma.DeliveryPlanProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeliveryPlanProduct>
          }
          groupBy: {
            args: Prisma.DeliveryPlanProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeliveryPlanProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeliveryPlanProductCountArgs<ExtArgs>
            result: $Utils.Optional<DeliveryPlanProductCountAggregateOutputType> | number
          }
        }
      }
      HierarchicalInspectionChecklist: {
        payload: Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>
        fields: Prisma.HierarchicalInspectionChecklistFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HierarchicalInspectionChecklistFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HierarchicalInspectionChecklistFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>
          }
          findFirst: {
            args: Prisma.HierarchicalInspectionChecklistFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HierarchicalInspectionChecklistFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>
          }
          findMany: {
            args: Prisma.HierarchicalInspectionChecklistFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>[]
          }
          create: {
            args: Prisma.HierarchicalInspectionChecklistCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>
          }
          createMany: {
            args: Prisma.HierarchicalInspectionChecklistCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HierarchicalInspectionChecklistCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>[]
          }
          delete: {
            args: Prisma.HierarchicalInspectionChecklistDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>
          }
          update: {
            args: Prisma.HierarchicalInspectionChecklistUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>
          }
          deleteMany: {
            args: Prisma.HierarchicalInspectionChecklistDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HierarchicalInspectionChecklistUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.HierarchicalInspectionChecklistUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionChecklistPayload>
          }
          aggregate: {
            args: Prisma.HierarchicalInspectionChecklistAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHierarchicalInspectionChecklist>
          }
          groupBy: {
            args: Prisma.HierarchicalInspectionChecklistGroupByArgs<ExtArgs>
            result: $Utils.Optional<HierarchicalInspectionChecklistGroupByOutputType>[]
          }
          count: {
            args: Prisma.HierarchicalInspectionChecklistCountArgs<ExtArgs>
            result: $Utils.Optional<HierarchicalInspectionChecklistCountAggregateOutputType> | number
          }
        }
      }
      HierarchicalInspectionResponse: {
        payload: Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>
        fields: Prisma.HierarchicalInspectionResponseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HierarchicalInspectionResponseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HierarchicalInspectionResponseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>
          }
          findFirst: {
            args: Prisma.HierarchicalInspectionResponseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HierarchicalInspectionResponseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>
          }
          findMany: {
            args: Prisma.HierarchicalInspectionResponseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>[]
          }
          create: {
            args: Prisma.HierarchicalInspectionResponseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>
          }
          createMany: {
            args: Prisma.HierarchicalInspectionResponseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HierarchicalInspectionResponseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>[]
          }
          delete: {
            args: Prisma.HierarchicalInspectionResponseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>
          }
          update: {
            args: Prisma.HierarchicalInspectionResponseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>
          }
          deleteMany: {
            args: Prisma.HierarchicalInspectionResponseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HierarchicalInspectionResponseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.HierarchicalInspectionResponseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HierarchicalInspectionResponsePayload>
          }
          aggregate: {
            args: Prisma.HierarchicalInspectionResponseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHierarchicalInspectionResponse>
          }
          groupBy: {
            args: Prisma.HierarchicalInspectionResponseGroupByArgs<ExtArgs>
            result: $Utils.Optional<HierarchicalInspectionResponseGroupByOutputType>[]
          }
          count: {
            args: Prisma.HierarchicalInspectionResponseCountArgs<ExtArgs>
            result: $Utils.Optional<HierarchicalInspectionResponseCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    hierarchicalInspectionChecklists: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hierarchicalInspectionChecklists?: boolean | UserCountOutputTypeCountHierarchicalInspectionChecklistsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountHierarchicalInspectionChecklistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HierarchicalInspectionChecklistWhereInput
  }


  /**
   * Count Type HierarchicalInspectionChecklistCountOutputType
   */

  export type HierarchicalInspectionChecklistCountOutputType = {
    responses: number
  }

  export type HierarchicalInspectionChecklistCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    responses?: boolean | HierarchicalInspectionChecklistCountOutputTypeCountResponsesArgs
  }

  // Custom InputTypes
  /**
   * HierarchicalInspectionChecklistCountOutputType without action
   */
  export type HierarchicalInspectionChecklistCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklistCountOutputType
     */
    select?: HierarchicalInspectionChecklistCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * HierarchicalInspectionChecklistCountOutputType without action
   */
  export type HierarchicalInspectionChecklistCountOutputTypeCountResponsesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HierarchicalInspectionResponseWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    username: string | null
    email: string | null
    fullName: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    username: string | null
    email: string | null
    fullName: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    email: number
    fullName: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    email?: true
    fullName?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    email?: true
    fullName?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    email?: true
    fullName?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    username: string | null
    email: string
    fullName: string | null
    role: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    fullName?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    hierarchicalInspectionChecklists?: boolean | User$hierarchicalInspectionChecklistsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    fullName?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    username?: boolean
    email?: boolean
    fullName?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hierarchicalInspectionChecklists?: boolean | User$hierarchicalInspectionChecklistsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      hierarchicalInspectionChecklists: Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      username: string | null
      email: string
      fullName: string | null
      role: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    hierarchicalInspectionChecklists<T extends User$hierarchicalInspectionChecklistsArgs<ExtArgs> = {}>(args?: Subset<T, User$hierarchicalInspectionChecklistsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.hierarchicalInspectionChecklists
   */
  export type User$hierarchicalInspectionChecklistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    where?: HierarchicalInspectionChecklistWhereInput
    orderBy?: HierarchicalInspectionChecklistOrderByWithRelationInput | HierarchicalInspectionChecklistOrderByWithRelationInput[]
    cursor?: HierarchicalInspectionChecklistWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HierarchicalInspectionChecklistScalarFieldEnum | HierarchicalInspectionChecklistScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    sku: string | null
    category: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    sku: string | null
    category: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    sku: number
    category: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    sku?: true
    category?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    sku?: true
    category?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    sku?: true
    category?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    name: string
    sku: string
    category: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: ProductCountAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sku?: boolean
    category?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    hierarchicalInspectionChecklist?: boolean | Product$hierarchicalInspectionChecklistArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sku?: boolean
    category?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    sku?: boolean
    category?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hierarchicalInspectionChecklist?: boolean | Product$hierarchicalInspectionChecklistArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      hierarchicalInspectionChecklist: Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      sku: string
      category: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    hierarchicalInspectionChecklist<T extends Product$hierarchicalInspectionChecklistArgs<ExtArgs> = {}>(args?: Subset<T, Product$hierarchicalInspectionChecklistArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */ 
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly sku: FieldRef<"Product", 'String'>
    readonly category: FieldRef<"Product", 'String'>
    readonly status: FieldRef<"Product", 'String'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
  }

  /**
   * Product.hierarchicalInspectionChecklist
   */
  export type Product$hierarchicalInspectionChecklistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    where?: HierarchicalInspectionChecklistWhereInput
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model DeliveryPlanProduct
   */

  export type AggregateDeliveryPlanProduct = {
    _count: DeliveryPlanProductCountAggregateOutputType | null
    _min: DeliveryPlanProductMinAggregateOutputType | null
    _max: DeliveryPlanProductMaxAggregateOutputType | null
  }

  export type DeliveryPlanProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DeliveryPlanProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DeliveryPlanProductCountAggregateOutputType = {
    id: number
    name: number
    category: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DeliveryPlanProductMinAggregateInputType = {
    id?: true
    name?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DeliveryPlanProductMaxAggregateInputType = {
    id?: true
    name?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DeliveryPlanProductCountAggregateInputType = {
    id?: true
    name?: true
    category?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DeliveryPlanProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeliveryPlanProduct to aggregate.
     */
    where?: DeliveryPlanProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryPlanProducts to fetch.
     */
    orderBy?: DeliveryPlanProductOrderByWithRelationInput | DeliveryPlanProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeliveryPlanProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryPlanProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryPlanProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeliveryPlanProducts
    **/
    _count?: true | DeliveryPlanProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeliveryPlanProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeliveryPlanProductMaxAggregateInputType
  }

  export type GetDeliveryPlanProductAggregateType<T extends DeliveryPlanProductAggregateArgs> = {
        [P in keyof T & keyof AggregateDeliveryPlanProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeliveryPlanProduct[P]>
      : GetScalarType<T[P], AggregateDeliveryPlanProduct[P]>
  }




  export type DeliveryPlanProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeliveryPlanProductWhereInput
    orderBy?: DeliveryPlanProductOrderByWithAggregationInput | DeliveryPlanProductOrderByWithAggregationInput[]
    by: DeliveryPlanProductScalarFieldEnum[] | DeliveryPlanProductScalarFieldEnum
    having?: DeliveryPlanProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeliveryPlanProductCountAggregateInputType | true
    _min?: DeliveryPlanProductMinAggregateInputType
    _max?: DeliveryPlanProductMaxAggregateInputType
  }

  export type DeliveryPlanProductGroupByOutputType = {
    id: string
    name: string
    category: string
    createdAt: Date
    updatedAt: Date
    _count: DeliveryPlanProductCountAggregateOutputType | null
    _min: DeliveryPlanProductMinAggregateOutputType | null
    _max: DeliveryPlanProductMaxAggregateOutputType | null
  }

  type GetDeliveryPlanProductGroupByPayload<T extends DeliveryPlanProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeliveryPlanProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeliveryPlanProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeliveryPlanProductGroupByOutputType[P]>
            : GetScalarType<T[P], DeliveryPlanProductGroupByOutputType[P]>
        }
      >
    >


  export type DeliveryPlanProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    hierarchicalInspectionChecklist?: boolean | DeliveryPlanProduct$hierarchicalInspectionChecklistArgs<ExtArgs>
  }, ExtArgs["result"]["deliveryPlanProduct"]>

  export type DeliveryPlanProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["deliveryPlanProduct"]>

  export type DeliveryPlanProductSelectScalar = {
    id?: boolean
    name?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DeliveryPlanProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hierarchicalInspectionChecklist?: boolean | DeliveryPlanProduct$hierarchicalInspectionChecklistArgs<ExtArgs>
  }
  export type DeliveryPlanProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DeliveryPlanProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeliveryPlanProduct"
    objects: {
      hierarchicalInspectionChecklist: Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      category: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["deliveryPlanProduct"]>
    composites: {}
  }

  type DeliveryPlanProductGetPayload<S extends boolean | null | undefined | DeliveryPlanProductDefaultArgs> = $Result.GetResult<Prisma.$DeliveryPlanProductPayload, S>

  type DeliveryPlanProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DeliveryPlanProductFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DeliveryPlanProductCountAggregateInputType | true
    }

  export interface DeliveryPlanProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeliveryPlanProduct'], meta: { name: 'DeliveryPlanProduct' } }
    /**
     * Find zero or one DeliveryPlanProduct that matches the filter.
     * @param {DeliveryPlanProductFindUniqueArgs} args - Arguments to find a DeliveryPlanProduct
     * @example
     * // Get one DeliveryPlanProduct
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeliveryPlanProductFindUniqueArgs>(args: SelectSubset<T, DeliveryPlanProductFindUniqueArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DeliveryPlanProduct that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DeliveryPlanProductFindUniqueOrThrowArgs} args - Arguments to find a DeliveryPlanProduct
     * @example
     * // Get one DeliveryPlanProduct
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeliveryPlanProductFindUniqueOrThrowArgs>(args: SelectSubset<T, DeliveryPlanProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DeliveryPlanProduct that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryPlanProductFindFirstArgs} args - Arguments to find a DeliveryPlanProduct
     * @example
     * // Get one DeliveryPlanProduct
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeliveryPlanProductFindFirstArgs>(args?: SelectSubset<T, DeliveryPlanProductFindFirstArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DeliveryPlanProduct that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryPlanProductFindFirstOrThrowArgs} args - Arguments to find a DeliveryPlanProduct
     * @example
     * // Get one DeliveryPlanProduct
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeliveryPlanProductFindFirstOrThrowArgs>(args?: SelectSubset<T, DeliveryPlanProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DeliveryPlanProducts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryPlanProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeliveryPlanProducts
     * const deliveryPlanProducts = await prisma.deliveryPlanProduct.findMany()
     * 
     * // Get first 10 DeliveryPlanProducts
     * const deliveryPlanProducts = await prisma.deliveryPlanProduct.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deliveryPlanProductWithIdOnly = await prisma.deliveryPlanProduct.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeliveryPlanProductFindManyArgs>(args?: SelectSubset<T, DeliveryPlanProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DeliveryPlanProduct.
     * @param {DeliveryPlanProductCreateArgs} args - Arguments to create a DeliveryPlanProduct.
     * @example
     * // Create one DeliveryPlanProduct
     * const DeliveryPlanProduct = await prisma.deliveryPlanProduct.create({
     *   data: {
     *     // ... data to create a DeliveryPlanProduct
     *   }
     * })
     * 
     */
    create<T extends DeliveryPlanProductCreateArgs>(args: SelectSubset<T, DeliveryPlanProductCreateArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DeliveryPlanProducts.
     * @param {DeliveryPlanProductCreateManyArgs} args - Arguments to create many DeliveryPlanProducts.
     * @example
     * // Create many DeliveryPlanProducts
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeliveryPlanProductCreateManyArgs>(args?: SelectSubset<T, DeliveryPlanProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DeliveryPlanProducts and returns the data saved in the database.
     * @param {DeliveryPlanProductCreateManyAndReturnArgs} args - Arguments to create many DeliveryPlanProducts.
     * @example
     * // Create many DeliveryPlanProducts
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DeliveryPlanProducts and only return the `id`
     * const deliveryPlanProductWithIdOnly = await prisma.deliveryPlanProduct.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeliveryPlanProductCreateManyAndReturnArgs>(args?: SelectSubset<T, DeliveryPlanProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DeliveryPlanProduct.
     * @param {DeliveryPlanProductDeleteArgs} args - Arguments to delete one DeliveryPlanProduct.
     * @example
     * // Delete one DeliveryPlanProduct
     * const DeliveryPlanProduct = await prisma.deliveryPlanProduct.delete({
     *   where: {
     *     // ... filter to delete one DeliveryPlanProduct
     *   }
     * })
     * 
     */
    delete<T extends DeliveryPlanProductDeleteArgs>(args: SelectSubset<T, DeliveryPlanProductDeleteArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DeliveryPlanProduct.
     * @param {DeliveryPlanProductUpdateArgs} args - Arguments to update one DeliveryPlanProduct.
     * @example
     * // Update one DeliveryPlanProduct
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeliveryPlanProductUpdateArgs>(args: SelectSubset<T, DeliveryPlanProductUpdateArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DeliveryPlanProducts.
     * @param {DeliveryPlanProductDeleteManyArgs} args - Arguments to filter DeliveryPlanProducts to delete.
     * @example
     * // Delete a few DeliveryPlanProducts
     * const { count } = await prisma.deliveryPlanProduct.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeliveryPlanProductDeleteManyArgs>(args?: SelectSubset<T, DeliveryPlanProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeliveryPlanProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryPlanProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeliveryPlanProducts
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeliveryPlanProductUpdateManyArgs>(args: SelectSubset<T, DeliveryPlanProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DeliveryPlanProduct.
     * @param {DeliveryPlanProductUpsertArgs} args - Arguments to update or create a DeliveryPlanProduct.
     * @example
     * // Update or create a DeliveryPlanProduct
     * const deliveryPlanProduct = await prisma.deliveryPlanProduct.upsert({
     *   create: {
     *     // ... data to create a DeliveryPlanProduct
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeliveryPlanProduct we want to update
     *   }
     * })
     */
    upsert<T extends DeliveryPlanProductUpsertArgs>(args: SelectSubset<T, DeliveryPlanProductUpsertArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DeliveryPlanProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryPlanProductCountArgs} args - Arguments to filter DeliveryPlanProducts to count.
     * @example
     * // Count the number of DeliveryPlanProducts
     * const count = await prisma.deliveryPlanProduct.count({
     *   where: {
     *     // ... the filter for the DeliveryPlanProducts we want to count
     *   }
     * })
    **/
    count<T extends DeliveryPlanProductCountArgs>(
      args?: Subset<T, DeliveryPlanProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeliveryPlanProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeliveryPlanProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryPlanProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeliveryPlanProductAggregateArgs>(args: Subset<T, DeliveryPlanProductAggregateArgs>): Prisma.PrismaPromise<GetDeliveryPlanProductAggregateType<T>>

    /**
     * Group by DeliveryPlanProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryPlanProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeliveryPlanProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeliveryPlanProductGroupByArgs['orderBy'] }
        : { orderBy?: DeliveryPlanProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeliveryPlanProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeliveryPlanProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeliveryPlanProduct model
   */
  readonly fields: DeliveryPlanProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeliveryPlanProduct.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeliveryPlanProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    hierarchicalInspectionChecklist<T extends DeliveryPlanProduct$hierarchicalInspectionChecklistArgs<ExtArgs> = {}>(args?: Subset<T, DeliveryPlanProduct$hierarchicalInspectionChecklistArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeliveryPlanProduct model
   */ 
  interface DeliveryPlanProductFieldRefs {
    readonly id: FieldRef<"DeliveryPlanProduct", 'String'>
    readonly name: FieldRef<"DeliveryPlanProduct", 'String'>
    readonly category: FieldRef<"DeliveryPlanProduct", 'String'>
    readonly createdAt: FieldRef<"DeliveryPlanProduct", 'DateTime'>
    readonly updatedAt: FieldRef<"DeliveryPlanProduct", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DeliveryPlanProduct findUnique
   */
  export type DeliveryPlanProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryPlanProduct to fetch.
     */
    where: DeliveryPlanProductWhereUniqueInput
  }

  /**
   * DeliveryPlanProduct findUniqueOrThrow
   */
  export type DeliveryPlanProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryPlanProduct to fetch.
     */
    where: DeliveryPlanProductWhereUniqueInput
  }

  /**
   * DeliveryPlanProduct findFirst
   */
  export type DeliveryPlanProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryPlanProduct to fetch.
     */
    where?: DeliveryPlanProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryPlanProducts to fetch.
     */
    orderBy?: DeliveryPlanProductOrderByWithRelationInput | DeliveryPlanProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeliveryPlanProducts.
     */
    cursor?: DeliveryPlanProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryPlanProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryPlanProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeliveryPlanProducts.
     */
    distinct?: DeliveryPlanProductScalarFieldEnum | DeliveryPlanProductScalarFieldEnum[]
  }

  /**
   * DeliveryPlanProduct findFirstOrThrow
   */
  export type DeliveryPlanProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryPlanProduct to fetch.
     */
    where?: DeliveryPlanProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryPlanProducts to fetch.
     */
    orderBy?: DeliveryPlanProductOrderByWithRelationInput | DeliveryPlanProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeliveryPlanProducts.
     */
    cursor?: DeliveryPlanProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryPlanProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryPlanProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeliveryPlanProducts.
     */
    distinct?: DeliveryPlanProductScalarFieldEnum | DeliveryPlanProductScalarFieldEnum[]
  }

  /**
   * DeliveryPlanProduct findMany
   */
  export type DeliveryPlanProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryPlanProducts to fetch.
     */
    where?: DeliveryPlanProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryPlanProducts to fetch.
     */
    orderBy?: DeliveryPlanProductOrderByWithRelationInput | DeliveryPlanProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeliveryPlanProducts.
     */
    cursor?: DeliveryPlanProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryPlanProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryPlanProducts.
     */
    skip?: number
    distinct?: DeliveryPlanProductScalarFieldEnum | DeliveryPlanProductScalarFieldEnum[]
  }

  /**
   * DeliveryPlanProduct create
   */
  export type DeliveryPlanProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * The data needed to create a DeliveryPlanProduct.
     */
    data: XOR<DeliveryPlanProductCreateInput, DeliveryPlanProductUncheckedCreateInput>
  }

  /**
   * DeliveryPlanProduct createMany
   */
  export type DeliveryPlanProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeliveryPlanProducts.
     */
    data: DeliveryPlanProductCreateManyInput | DeliveryPlanProductCreateManyInput[]
  }

  /**
   * DeliveryPlanProduct createManyAndReturn
   */
  export type DeliveryPlanProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DeliveryPlanProducts.
     */
    data: DeliveryPlanProductCreateManyInput | DeliveryPlanProductCreateManyInput[]
  }

  /**
   * DeliveryPlanProduct update
   */
  export type DeliveryPlanProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * The data needed to update a DeliveryPlanProduct.
     */
    data: XOR<DeliveryPlanProductUpdateInput, DeliveryPlanProductUncheckedUpdateInput>
    /**
     * Choose, which DeliveryPlanProduct to update.
     */
    where: DeliveryPlanProductWhereUniqueInput
  }

  /**
   * DeliveryPlanProduct updateMany
   */
  export type DeliveryPlanProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeliveryPlanProducts.
     */
    data: XOR<DeliveryPlanProductUpdateManyMutationInput, DeliveryPlanProductUncheckedUpdateManyInput>
    /**
     * Filter which DeliveryPlanProducts to update
     */
    where?: DeliveryPlanProductWhereInput
  }

  /**
   * DeliveryPlanProduct upsert
   */
  export type DeliveryPlanProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * The filter to search for the DeliveryPlanProduct to update in case it exists.
     */
    where: DeliveryPlanProductWhereUniqueInput
    /**
     * In case the DeliveryPlanProduct found by the `where` argument doesn't exist, create a new DeliveryPlanProduct with this data.
     */
    create: XOR<DeliveryPlanProductCreateInput, DeliveryPlanProductUncheckedCreateInput>
    /**
     * In case the DeliveryPlanProduct was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeliveryPlanProductUpdateInput, DeliveryPlanProductUncheckedUpdateInput>
  }

  /**
   * DeliveryPlanProduct delete
   */
  export type DeliveryPlanProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    /**
     * Filter which DeliveryPlanProduct to delete.
     */
    where: DeliveryPlanProductWhereUniqueInput
  }

  /**
   * DeliveryPlanProduct deleteMany
   */
  export type DeliveryPlanProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeliveryPlanProducts to delete
     */
    where?: DeliveryPlanProductWhereInput
  }

  /**
   * DeliveryPlanProduct.hierarchicalInspectionChecklist
   */
  export type DeliveryPlanProduct$hierarchicalInspectionChecklistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    where?: HierarchicalInspectionChecklistWhereInput
  }

  /**
   * DeliveryPlanProduct without action
   */
  export type DeliveryPlanProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
  }


  /**
   * Model HierarchicalInspectionChecklist
   */

  export type AggregateHierarchicalInspectionChecklist = {
    _count: HierarchicalInspectionChecklistCountAggregateOutputType | null
    _min: HierarchicalInspectionChecklistMinAggregateOutputType | null
    _max: HierarchicalInspectionChecklistMaxAggregateOutputType | null
  }

  export type HierarchicalInspectionChecklistMinAggregateOutputType = {
    id: string | null
    productId: string | null
    deliveryPlanProductId: string | null
    createdBy: string | null
    createdAt: Date | null
    verifiedBy: string | null
    verifiedAt: Date | null
    updatedBy: string | null
    updatedAt: Date | null
    notes: string | null
  }

  export type HierarchicalInspectionChecklistMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    deliveryPlanProductId: string | null
    createdBy: string | null
    createdAt: Date | null
    verifiedBy: string | null
    verifiedAt: Date | null
    updatedBy: string | null
    updatedAt: Date | null
    notes: string | null
  }

  export type HierarchicalInspectionChecklistCountAggregateOutputType = {
    id: number
    productId: number
    deliveryPlanProductId: number
    createdBy: number
    createdAt: number
    verifiedBy: number
    verifiedAt: number
    updatedBy: number
    updatedAt: number
    notes: number
    _all: number
  }


  export type HierarchicalInspectionChecklistMinAggregateInputType = {
    id?: true
    productId?: true
    deliveryPlanProductId?: true
    createdBy?: true
    createdAt?: true
    verifiedBy?: true
    verifiedAt?: true
    updatedBy?: true
    updatedAt?: true
    notes?: true
  }

  export type HierarchicalInspectionChecklistMaxAggregateInputType = {
    id?: true
    productId?: true
    deliveryPlanProductId?: true
    createdBy?: true
    createdAt?: true
    verifiedBy?: true
    verifiedAt?: true
    updatedBy?: true
    updatedAt?: true
    notes?: true
  }

  export type HierarchicalInspectionChecklistCountAggregateInputType = {
    id?: true
    productId?: true
    deliveryPlanProductId?: true
    createdBy?: true
    createdAt?: true
    verifiedBy?: true
    verifiedAt?: true
    updatedBy?: true
    updatedAt?: true
    notes?: true
    _all?: true
  }

  export type HierarchicalInspectionChecklistAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HierarchicalInspectionChecklist to aggregate.
     */
    where?: HierarchicalInspectionChecklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionChecklists to fetch.
     */
    orderBy?: HierarchicalInspectionChecklistOrderByWithRelationInput | HierarchicalInspectionChecklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HierarchicalInspectionChecklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionChecklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionChecklists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HierarchicalInspectionChecklists
    **/
    _count?: true | HierarchicalInspectionChecklistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HierarchicalInspectionChecklistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HierarchicalInspectionChecklistMaxAggregateInputType
  }

  export type GetHierarchicalInspectionChecklistAggregateType<T extends HierarchicalInspectionChecklistAggregateArgs> = {
        [P in keyof T & keyof AggregateHierarchicalInspectionChecklist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHierarchicalInspectionChecklist[P]>
      : GetScalarType<T[P], AggregateHierarchicalInspectionChecklist[P]>
  }




  export type HierarchicalInspectionChecklistGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HierarchicalInspectionChecklistWhereInput
    orderBy?: HierarchicalInspectionChecklistOrderByWithAggregationInput | HierarchicalInspectionChecklistOrderByWithAggregationInput[]
    by: HierarchicalInspectionChecklistScalarFieldEnum[] | HierarchicalInspectionChecklistScalarFieldEnum
    having?: HierarchicalInspectionChecklistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HierarchicalInspectionChecklistCountAggregateInputType | true
    _min?: HierarchicalInspectionChecklistMinAggregateInputType
    _max?: HierarchicalInspectionChecklistMaxAggregateInputType
  }

  export type HierarchicalInspectionChecklistGroupByOutputType = {
    id: string
    productId: string | null
    deliveryPlanProductId: string | null
    createdBy: string
    createdAt: Date
    verifiedBy: string | null
    verifiedAt: Date | null
    updatedBy: string | null
    updatedAt: Date
    notes: string | null
    _count: HierarchicalInspectionChecklistCountAggregateOutputType | null
    _min: HierarchicalInspectionChecklistMinAggregateOutputType | null
    _max: HierarchicalInspectionChecklistMaxAggregateOutputType | null
  }

  type GetHierarchicalInspectionChecklistGroupByPayload<T extends HierarchicalInspectionChecklistGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HierarchicalInspectionChecklistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HierarchicalInspectionChecklistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HierarchicalInspectionChecklistGroupByOutputType[P]>
            : GetScalarType<T[P], HierarchicalInspectionChecklistGroupByOutputType[P]>
        }
      >
    >


  export type HierarchicalInspectionChecklistSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    deliveryPlanProductId?: boolean
    createdBy?: boolean
    createdAt?: boolean
    verifiedBy?: boolean
    verifiedAt?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    notes?: boolean
    responses?: boolean | HierarchicalInspectionChecklist$responsesArgs<ExtArgs>
    product?: boolean | HierarchicalInspectionChecklist$productArgs<ExtArgs>
    deliveryPlanProduct?: boolean | HierarchicalInspectionChecklist$deliveryPlanProductArgs<ExtArgs>
    createdByUser?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | HierarchicalInspectionChecklistCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hierarchicalInspectionChecklist"]>

  export type HierarchicalInspectionChecklistSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    deliveryPlanProductId?: boolean
    createdBy?: boolean
    createdAt?: boolean
    verifiedBy?: boolean
    verifiedAt?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    notes?: boolean
    product?: boolean | HierarchicalInspectionChecklist$productArgs<ExtArgs>
    deliveryPlanProduct?: boolean | HierarchicalInspectionChecklist$deliveryPlanProductArgs<ExtArgs>
    createdByUser?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hierarchicalInspectionChecklist"]>

  export type HierarchicalInspectionChecklistSelectScalar = {
    id?: boolean
    productId?: boolean
    deliveryPlanProductId?: boolean
    createdBy?: boolean
    createdAt?: boolean
    verifiedBy?: boolean
    verifiedAt?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    notes?: boolean
  }

  export type HierarchicalInspectionChecklistInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    responses?: boolean | HierarchicalInspectionChecklist$responsesArgs<ExtArgs>
    product?: boolean | HierarchicalInspectionChecklist$productArgs<ExtArgs>
    deliveryPlanProduct?: boolean | HierarchicalInspectionChecklist$deliveryPlanProductArgs<ExtArgs>
    createdByUser?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | HierarchicalInspectionChecklistCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type HierarchicalInspectionChecklistIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | HierarchicalInspectionChecklist$productArgs<ExtArgs>
    deliveryPlanProduct?: boolean | HierarchicalInspectionChecklist$deliveryPlanProductArgs<ExtArgs>
    createdByUser?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $HierarchicalInspectionChecklistPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HierarchicalInspectionChecklist"
    objects: {
      responses: Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>[]
      product: Prisma.$ProductPayload<ExtArgs> | null
      deliveryPlanProduct: Prisma.$DeliveryPlanProductPayload<ExtArgs> | null
      createdByUser: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string | null
      deliveryPlanProductId: string | null
      createdBy: string
      createdAt: Date
      verifiedBy: string | null
      verifiedAt: Date | null
      updatedBy: string | null
      updatedAt: Date
      notes: string | null
    }, ExtArgs["result"]["hierarchicalInspectionChecklist"]>
    composites: {}
  }

  type HierarchicalInspectionChecklistGetPayload<S extends boolean | null | undefined | HierarchicalInspectionChecklistDefaultArgs> = $Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload, S>

  type HierarchicalInspectionChecklistCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<HierarchicalInspectionChecklistFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: HierarchicalInspectionChecklistCountAggregateInputType | true
    }

  export interface HierarchicalInspectionChecklistDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HierarchicalInspectionChecklist'], meta: { name: 'HierarchicalInspectionChecklist' } }
    /**
     * Find zero or one HierarchicalInspectionChecklist that matches the filter.
     * @param {HierarchicalInspectionChecklistFindUniqueArgs} args - Arguments to find a HierarchicalInspectionChecklist
     * @example
     * // Get one HierarchicalInspectionChecklist
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HierarchicalInspectionChecklistFindUniqueArgs>(args: SelectSubset<T, HierarchicalInspectionChecklistFindUniqueArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one HierarchicalInspectionChecklist that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {HierarchicalInspectionChecklistFindUniqueOrThrowArgs} args - Arguments to find a HierarchicalInspectionChecklist
     * @example
     * // Get one HierarchicalInspectionChecklist
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HierarchicalInspectionChecklistFindUniqueOrThrowArgs>(args: SelectSubset<T, HierarchicalInspectionChecklistFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first HierarchicalInspectionChecklist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionChecklistFindFirstArgs} args - Arguments to find a HierarchicalInspectionChecklist
     * @example
     * // Get one HierarchicalInspectionChecklist
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HierarchicalInspectionChecklistFindFirstArgs>(args?: SelectSubset<T, HierarchicalInspectionChecklistFindFirstArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first HierarchicalInspectionChecklist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionChecklistFindFirstOrThrowArgs} args - Arguments to find a HierarchicalInspectionChecklist
     * @example
     * // Get one HierarchicalInspectionChecklist
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HierarchicalInspectionChecklistFindFirstOrThrowArgs>(args?: SelectSubset<T, HierarchicalInspectionChecklistFindFirstOrThrowArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more HierarchicalInspectionChecklists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionChecklistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HierarchicalInspectionChecklists
     * const hierarchicalInspectionChecklists = await prisma.hierarchicalInspectionChecklist.findMany()
     * 
     * // Get first 10 HierarchicalInspectionChecklists
     * const hierarchicalInspectionChecklists = await prisma.hierarchicalInspectionChecklist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hierarchicalInspectionChecklistWithIdOnly = await prisma.hierarchicalInspectionChecklist.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HierarchicalInspectionChecklistFindManyArgs>(args?: SelectSubset<T, HierarchicalInspectionChecklistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a HierarchicalInspectionChecklist.
     * @param {HierarchicalInspectionChecklistCreateArgs} args - Arguments to create a HierarchicalInspectionChecklist.
     * @example
     * // Create one HierarchicalInspectionChecklist
     * const HierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.create({
     *   data: {
     *     // ... data to create a HierarchicalInspectionChecklist
     *   }
     * })
     * 
     */
    create<T extends HierarchicalInspectionChecklistCreateArgs>(args: SelectSubset<T, HierarchicalInspectionChecklistCreateArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many HierarchicalInspectionChecklists.
     * @param {HierarchicalInspectionChecklistCreateManyArgs} args - Arguments to create many HierarchicalInspectionChecklists.
     * @example
     * // Create many HierarchicalInspectionChecklists
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HierarchicalInspectionChecklistCreateManyArgs>(args?: SelectSubset<T, HierarchicalInspectionChecklistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HierarchicalInspectionChecklists and returns the data saved in the database.
     * @param {HierarchicalInspectionChecklistCreateManyAndReturnArgs} args - Arguments to create many HierarchicalInspectionChecklists.
     * @example
     * // Create many HierarchicalInspectionChecklists
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HierarchicalInspectionChecklists and only return the `id`
     * const hierarchicalInspectionChecklistWithIdOnly = await prisma.hierarchicalInspectionChecklist.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HierarchicalInspectionChecklistCreateManyAndReturnArgs>(args?: SelectSubset<T, HierarchicalInspectionChecklistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a HierarchicalInspectionChecklist.
     * @param {HierarchicalInspectionChecklistDeleteArgs} args - Arguments to delete one HierarchicalInspectionChecklist.
     * @example
     * // Delete one HierarchicalInspectionChecklist
     * const HierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.delete({
     *   where: {
     *     // ... filter to delete one HierarchicalInspectionChecklist
     *   }
     * })
     * 
     */
    delete<T extends HierarchicalInspectionChecklistDeleteArgs>(args: SelectSubset<T, HierarchicalInspectionChecklistDeleteArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one HierarchicalInspectionChecklist.
     * @param {HierarchicalInspectionChecklistUpdateArgs} args - Arguments to update one HierarchicalInspectionChecklist.
     * @example
     * // Update one HierarchicalInspectionChecklist
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HierarchicalInspectionChecklistUpdateArgs>(args: SelectSubset<T, HierarchicalInspectionChecklistUpdateArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more HierarchicalInspectionChecklists.
     * @param {HierarchicalInspectionChecklistDeleteManyArgs} args - Arguments to filter HierarchicalInspectionChecklists to delete.
     * @example
     * // Delete a few HierarchicalInspectionChecklists
     * const { count } = await prisma.hierarchicalInspectionChecklist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HierarchicalInspectionChecklistDeleteManyArgs>(args?: SelectSubset<T, HierarchicalInspectionChecklistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HierarchicalInspectionChecklists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionChecklistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HierarchicalInspectionChecklists
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HierarchicalInspectionChecklistUpdateManyArgs>(args: SelectSubset<T, HierarchicalInspectionChecklistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one HierarchicalInspectionChecklist.
     * @param {HierarchicalInspectionChecklistUpsertArgs} args - Arguments to update or create a HierarchicalInspectionChecklist.
     * @example
     * // Update or create a HierarchicalInspectionChecklist
     * const hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.upsert({
     *   create: {
     *     // ... data to create a HierarchicalInspectionChecklist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HierarchicalInspectionChecklist we want to update
     *   }
     * })
     */
    upsert<T extends HierarchicalInspectionChecklistUpsertArgs>(args: SelectSubset<T, HierarchicalInspectionChecklistUpsertArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of HierarchicalInspectionChecklists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionChecklistCountArgs} args - Arguments to filter HierarchicalInspectionChecklists to count.
     * @example
     * // Count the number of HierarchicalInspectionChecklists
     * const count = await prisma.hierarchicalInspectionChecklist.count({
     *   where: {
     *     // ... the filter for the HierarchicalInspectionChecklists we want to count
     *   }
     * })
    **/
    count<T extends HierarchicalInspectionChecklistCountArgs>(
      args?: Subset<T, HierarchicalInspectionChecklistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HierarchicalInspectionChecklistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HierarchicalInspectionChecklist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionChecklistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HierarchicalInspectionChecklistAggregateArgs>(args: Subset<T, HierarchicalInspectionChecklistAggregateArgs>): Prisma.PrismaPromise<GetHierarchicalInspectionChecklistAggregateType<T>>

    /**
     * Group by HierarchicalInspectionChecklist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionChecklistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HierarchicalInspectionChecklistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HierarchicalInspectionChecklistGroupByArgs['orderBy'] }
        : { orderBy?: HierarchicalInspectionChecklistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HierarchicalInspectionChecklistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHierarchicalInspectionChecklistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HierarchicalInspectionChecklist model
   */
  readonly fields: HierarchicalInspectionChecklistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HierarchicalInspectionChecklist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HierarchicalInspectionChecklistClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    responses<T extends HierarchicalInspectionChecklist$responsesArgs<ExtArgs> = {}>(args?: Subset<T, HierarchicalInspectionChecklist$responsesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "findMany"> | Null>
    product<T extends HierarchicalInspectionChecklist$productArgs<ExtArgs> = {}>(args?: Subset<T, HierarchicalInspectionChecklist$productArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    deliveryPlanProduct<T extends HierarchicalInspectionChecklist$deliveryPlanProductArgs<ExtArgs> = {}>(args?: Subset<T, HierarchicalInspectionChecklist$deliveryPlanProductArgs<ExtArgs>>): Prisma__DeliveryPlanProductClient<$Result.GetResult<Prisma.$DeliveryPlanProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    createdByUser<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HierarchicalInspectionChecklist model
   */ 
  interface HierarchicalInspectionChecklistFieldRefs {
    readonly id: FieldRef<"HierarchicalInspectionChecklist", 'String'>
    readonly productId: FieldRef<"HierarchicalInspectionChecklist", 'String'>
    readonly deliveryPlanProductId: FieldRef<"HierarchicalInspectionChecklist", 'String'>
    readonly createdBy: FieldRef<"HierarchicalInspectionChecklist", 'String'>
    readonly createdAt: FieldRef<"HierarchicalInspectionChecklist", 'DateTime'>
    readonly verifiedBy: FieldRef<"HierarchicalInspectionChecklist", 'String'>
    readonly verifiedAt: FieldRef<"HierarchicalInspectionChecklist", 'DateTime'>
    readonly updatedBy: FieldRef<"HierarchicalInspectionChecklist", 'String'>
    readonly updatedAt: FieldRef<"HierarchicalInspectionChecklist", 'DateTime'>
    readonly notes: FieldRef<"HierarchicalInspectionChecklist", 'String'>
  }
    

  // Custom InputTypes
  /**
   * HierarchicalInspectionChecklist findUnique
   */
  export type HierarchicalInspectionChecklistFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionChecklist to fetch.
     */
    where: HierarchicalInspectionChecklistWhereUniqueInput
  }

  /**
   * HierarchicalInspectionChecklist findUniqueOrThrow
   */
  export type HierarchicalInspectionChecklistFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionChecklist to fetch.
     */
    where: HierarchicalInspectionChecklistWhereUniqueInput
  }

  /**
   * HierarchicalInspectionChecklist findFirst
   */
  export type HierarchicalInspectionChecklistFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionChecklist to fetch.
     */
    where?: HierarchicalInspectionChecklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionChecklists to fetch.
     */
    orderBy?: HierarchicalInspectionChecklistOrderByWithRelationInput | HierarchicalInspectionChecklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HierarchicalInspectionChecklists.
     */
    cursor?: HierarchicalInspectionChecklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionChecklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionChecklists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HierarchicalInspectionChecklists.
     */
    distinct?: HierarchicalInspectionChecklistScalarFieldEnum | HierarchicalInspectionChecklistScalarFieldEnum[]
  }

  /**
   * HierarchicalInspectionChecklist findFirstOrThrow
   */
  export type HierarchicalInspectionChecklistFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionChecklist to fetch.
     */
    where?: HierarchicalInspectionChecklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionChecklists to fetch.
     */
    orderBy?: HierarchicalInspectionChecklistOrderByWithRelationInput | HierarchicalInspectionChecklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HierarchicalInspectionChecklists.
     */
    cursor?: HierarchicalInspectionChecklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionChecklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionChecklists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HierarchicalInspectionChecklists.
     */
    distinct?: HierarchicalInspectionChecklistScalarFieldEnum | HierarchicalInspectionChecklistScalarFieldEnum[]
  }

  /**
   * HierarchicalInspectionChecklist findMany
   */
  export type HierarchicalInspectionChecklistFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionChecklists to fetch.
     */
    where?: HierarchicalInspectionChecklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionChecklists to fetch.
     */
    orderBy?: HierarchicalInspectionChecklistOrderByWithRelationInput | HierarchicalInspectionChecklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HierarchicalInspectionChecklists.
     */
    cursor?: HierarchicalInspectionChecklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionChecklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionChecklists.
     */
    skip?: number
    distinct?: HierarchicalInspectionChecklistScalarFieldEnum | HierarchicalInspectionChecklistScalarFieldEnum[]
  }

  /**
   * HierarchicalInspectionChecklist create
   */
  export type HierarchicalInspectionChecklistCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * The data needed to create a HierarchicalInspectionChecklist.
     */
    data: XOR<HierarchicalInspectionChecklistCreateInput, HierarchicalInspectionChecklistUncheckedCreateInput>
  }

  /**
   * HierarchicalInspectionChecklist createMany
   */
  export type HierarchicalInspectionChecklistCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HierarchicalInspectionChecklists.
     */
    data: HierarchicalInspectionChecklistCreateManyInput | HierarchicalInspectionChecklistCreateManyInput[]
  }

  /**
   * HierarchicalInspectionChecklist createManyAndReturn
   */
  export type HierarchicalInspectionChecklistCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many HierarchicalInspectionChecklists.
     */
    data: HierarchicalInspectionChecklistCreateManyInput | HierarchicalInspectionChecklistCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * HierarchicalInspectionChecklist update
   */
  export type HierarchicalInspectionChecklistUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * The data needed to update a HierarchicalInspectionChecklist.
     */
    data: XOR<HierarchicalInspectionChecklistUpdateInput, HierarchicalInspectionChecklistUncheckedUpdateInput>
    /**
     * Choose, which HierarchicalInspectionChecklist to update.
     */
    where: HierarchicalInspectionChecklistWhereUniqueInput
  }

  /**
   * HierarchicalInspectionChecklist updateMany
   */
  export type HierarchicalInspectionChecklistUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HierarchicalInspectionChecklists.
     */
    data: XOR<HierarchicalInspectionChecklistUpdateManyMutationInput, HierarchicalInspectionChecklistUncheckedUpdateManyInput>
    /**
     * Filter which HierarchicalInspectionChecklists to update
     */
    where?: HierarchicalInspectionChecklistWhereInput
  }

  /**
   * HierarchicalInspectionChecklist upsert
   */
  export type HierarchicalInspectionChecklistUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * The filter to search for the HierarchicalInspectionChecklist to update in case it exists.
     */
    where: HierarchicalInspectionChecklistWhereUniqueInput
    /**
     * In case the HierarchicalInspectionChecklist found by the `where` argument doesn't exist, create a new HierarchicalInspectionChecklist with this data.
     */
    create: XOR<HierarchicalInspectionChecklistCreateInput, HierarchicalInspectionChecklistUncheckedCreateInput>
    /**
     * In case the HierarchicalInspectionChecklist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HierarchicalInspectionChecklistUpdateInput, HierarchicalInspectionChecklistUncheckedUpdateInput>
  }

  /**
   * HierarchicalInspectionChecklist delete
   */
  export type HierarchicalInspectionChecklistDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
    /**
     * Filter which HierarchicalInspectionChecklist to delete.
     */
    where: HierarchicalInspectionChecklistWhereUniqueInput
  }

  /**
   * HierarchicalInspectionChecklist deleteMany
   */
  export type HierarchicalInspectionChecklistDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HierarchicalInspectionChecklists to delete
     */
    where?: HierarchicalInspectionChecklistWhereInput
  }

  /**
   * HierarchicalInspectionChecklist.responses
   */
  export type HierarchicalInspectionChecklist$responsesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    where?: HierarchicalInspectionResponseWhereInput
    orderBy?: HierarchicalInspectionResponseOrderByWithRelationInput | HierarchicalInspectionResponseOrderByWithRelationInput[]
    cursor?: HierarchicalInspectionResponseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HierarchicalInspectionResponseScalarFieldEnum | HierarchicalInspectionResponseScalarFieldEnum[]
  }

  /**
   * HierarchicalInspectionChecklist.product
   */
  export type HierarchicalInspectionChecklist$productArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
  }

  /**
   * HierarchicalInspectionChecklist.deliveryPlanProduct
   */
  export type HierarchicalInspectionChecklist$deliveryPlanProductArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryPlanProduct
     */
    select?: DeliveryPlanProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryPlanProductInclude<ExtArgs> | null
    where?: DeliveryPlanProductWhereInput
  }

  /**
   * HierarchicalInspectionChecklist without action
   */
  export type HierarchicalInspectionChecklistDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionChecklist
     */
    select?: HierarchicalInspectionChecklistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionChecklistInclude<ExtArgs> | null
  }


  /**
   * Model HierarchicalInspectionResponse
   */

  export type AggregateHierarchicalInspectionResponse = {
    _count: HierarchicalInspectionResponseCountAggregateOutputType | null
    _min: HierarchicalInspectionResponseMinAggregateOutputType | null
    _max: HierarchicalInspectionResponseMaxAggregateOutputType | null
  }

  export type HierarchicalInspectionResponseMinAggregateOutputType = {
    id: string | null
    checklistId: string | null
    categoryId: string | null
    itemId: string | null
    booleanValue: boolean | null
    textValue: string | null
    createdAt: Date | null
  }

  export type HierarchicalInspectionResponseMaxAggregateOutputType = {
    id: string | null
    checklistId: string | null
    categoryId: string | null
    itemId: string | null
    booleanValue: boolean | null
    textValue: string | null
    createdAt: Date | null
  }

  export type HierarchicalInspectionResponseCountAggregateOutputType = {
    id: number
    checklistId: number
    categoryId: number
    itemId: number
    booleanValue: number
    textValue: number
    createdAt: number
    _all: number
  }


  export type HierarchicalInspectionResponseMinAggregateInputType = {
    id?: true
    checklistId?: true
    categoryId?: true
    itemId?: true
    booleanValue?: true
    textValue?: true
    createdAt?: true
  }

  export type HierarchicalInspectionResponseMaxAggregateInputType = {
    id?: true
    checklistId?: true
    categoryId?: true
    itemId?: true
    booleanValue?: true
    textValue?: true
    createdAt?: true
  }

  export type HierarchicalInspectionResponseCountAggregateInputType = {
    id?: true
    checklistId?: true
    categoryId?: true
    itemId?: true
    booleanValue?: true
    textValue?: true
    createdAt?: true
    _all?: true
  }

  export type HierarchicalInspectionResponseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HierarchicalInspectionResponse to aggregate.
     */
    where?: HierarchicalInspectionResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionResponses to fetch.
     */
    orderBy?: HierarchicalInspectionResponseOrderByWithRelationInput | HierarchicalInspectionResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HierarchicalInspectionResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HierarchicalInspectionResponses
    **/
    _count?: true | HierarchicalInspectionResponseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HierarchicalInspectionResponseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HierarchicalInspectionResponseMaxAggregateInputType
  }

  export type GetHierarchicalInspectionResponseAggregateType<T extends HierarchicalInspectionResponseAggregateArgs> = {
        [P in keyof T & keyof AggregateHierarchicalInspectionResponse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHierarchicalInspectionResponse[P]>
      : GetScalarType<T[P], AggregateHierarchicalInspectionResponse[P]>
  }




  export type HierarchicalInspectionResponseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HierarchicalInspectionResponseWhereInput
    orderBy?: HierarchicalInspectionResponseOrderByWithAggregationInput | HierarchicalInspectionResponseOrderByWithAggregationInput[]
    by: HierarchicalInspectionResponseScalarFieldEnum[] | HierarchicalInspectionResponseScalarFieldEnum
    having?: HierarchicalInspectionResponseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HierarchicalInspectionResponseCountAggregateInputType | true
    _min?: HierarchicalInspectionResponseMinAggregateInputType
    _max?: HierarchicalInspectionResponseMaxAggregateInputType
  }

  export type HierarchicalInspectionResponseGroupByOutputType = {
    id: string
    checklistId: string
    categoryId: string
    itemId: string
    booleanValue: boolean | null
    textValue: string | null
    createdAt: Date
    _count: HierarchicalInspectionResponseCountAggregateOutputType | null
    _min: HierarchicalInspectionResponseMinAggregateOutputType | null
    _max: HierarchicalInspectionResponseMaxAggregateOutputType | null
  }

  type GetHierarchicalInspectionResponseGroupByPayload<T extends HierarchicalInspectionResponseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HierarchicalInspectionResponseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HierarchicalInspectionResponseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HierarchicalInspectionResponseGroupByOutputType[P]>
            : GetScalarType<T[P], HierarchicalInspectionResponseGroupByOutputType[P]>
        }
      >
    >


  export type HierarchicalInspectionResponseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    checklistId?: boolean
    categoryId?: boolean
    itemId?: boolean
    booleanValue?: boolean
    textValue?: boolean
    createdAt?: boolean
    checklist?: boolean | HierarchicalInspectionChecklistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hierarchicalInspectionResponse"]>

  export type HierarchicalInspectionResponseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    checklistId?: boolean
    categoryId?: boolean
    itemId?: boolean
    booleanValue?: boolean
    textValue?: boolean
    createdAt?: boolean
    checklist?: boolean | HierarchicalInspectionChecklistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hierarchicalInspectionResponse"]>

  export type HierarchicalInspectionResponseSelectScalar = {
    id?: boolean
    checklistId?: boolean
    categoryId?: boolean
    itemId?: boolean
    booleanValue?: boolean
    textValue?: boolean
    createdAt?: boolean
  }

  export type HierarchicalInspectionResponseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    checklist?: boolean | HierarchicalInspectionChecklistDefaultArgs<ExtArgs>
  }
  export type HierarchicalInspectionResponseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    checklist?: boolean | HierarchicalInspectionChecklistDefaultArgs<ExtArgs>
  }

  export type $HierarchicalInspectionResponsePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HierarchicalInspectionResponse"
    objects: {
      checklist: Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      checklistId: string
      categoryId: string
      itemId: string
      booleanValue: boolean | null
      textValue: string | null
      createdAt: Date
    }, ExtArgs["result"]["hierarchicalInspectionResponse"]>
    composites: {}
  }

  type HierarchicalInspectionResponseGetPayload<S extends boolean | null | undefined | HierarchicalInspectionResponseDefaultArgs> = $Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload, S>

  type HierarchicalInspectionResponseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<HierarchicalInspectionResponseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: HierarchicalInspectionResponseCountAggregateInputType | true
    }

  export interface HierarchicalInspectionResponseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HierarchicalInspectionResponse'], meta: { name: 'HierarchicalInspectionResponse' } }
    /**
     * Find zero or one HierarchicalInspectionResponse that matches the filter.
     * @param {HierarchicalInspectionResponseFindUniqueArgs} args - Arguments to find a HierarchicalInspectionResponse
     * @example
     * // Get one HierarchicalInspectionResponse
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HierarchicalInspectionResponseFindUniqueArgs>(args: SelectSubset<T, HierarchicalInspectionResponseFindUniqueArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one HierarchicalInspectionResponse that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {HierarchicalInspectionResponseFindUniqueOrThrowArgs} args - Arguments to find a HierarchicalInspectionResponse
     * @example
     * // Get one HierarchicalInspectionResponse
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HierarchicalInspectionResponseFindUniqueOrThrowArgs>(args: SelectSubset<T, HierarchicalInspectionResponseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first HierarchicalInspectionResponse that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionResponseFindFirstArgs} args - Arguments to find a HierarchicalInspectionResponse
     * @example
     * // Get one HierarchicalInspectionResponse
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HierarchicalInspectionResponseFindFirstArgs>(args?: SelectSubset<T, HierarchicalInspectionResponseFindFirstArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first HierarchicalInspectionResponse that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionResponseFindFirstOrThrowArgs} args - Arguments to find a HierarchicalInspectionResponse
     * @example
     * // Get one HierarchicalInspectionResponse
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HierarchicalInspectionResponseFindFirstOrThrowArgs>(args?: SelectSubset<T, HierarchicalInspectionResponseFindFirstOrThrowArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more HierarchicalInspectionResponses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionResponseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HierarchicalInspectionResponses
     * const hierarchicalInspectionResponses = await prisma.hierarchicalInspectionResponse.findMany()
     * 
     * // Get first 10 HierarchicalInspectionResponses
     * const hierarchicalInspectionResponses = await prisma.hierarchicalInspectionResponse.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hierarchicalInspectionResponseWithIdOnly = await prisma.hierarchicalInspectionResponse.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HierarchicalInspectionResponseFindManyArgs>(args?: SelectSubset<T, HierarchicalInspectionResponseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a HierarchicalInspectionResponse.
     * @param {HierarchicalInspectionResponseCreateArgs} args - Arguments to create a HierarchicalInspectionResponse.
     * @example
     * // Create one HierarchicalInspectionResponse
     * const HierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.create({
     *   data: {
     *     // ... data to create a HierarchicalInspectionResponse
     *   }
     * })
     * 
     */
    create<T extends HierarchicalInspectionResponseCreateArgs>(args: SelectSubset<T, HierarchicalInspectionResponseCreateArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many HierarchicalInspectionResponses.
     * @param {HierarchicalInspectionResponseCreateManyArgs} args - Arguments to create many HierarchicalInspectionResponses.
     * @example
     * // Create many HierarchicalInspectionResponses
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HierarchicalInspectionResponseCreateManyArgs>(args?: SelectSubset<T, HierarchicalInspectionResponseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HierarchicalInspectionResponses and returns the data saved in the database.
     * @param {HierarchicalInspectionResponseCreateManyAndReturnArgs} args - Arguments to create many HierarchicalInspectionResponses.
     * @example
     * // Create many HierarchicalInspectionResponses
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HierarchicalInspectionResponses and only return the `id`
     * const hierarchicalInspectionResponseWithIdOnly = await prisma.hierarchicalInspectionResponse.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HierarchicalInspectionResponseCreateManyAndReturnArgs>(args?: SelectSubset<T, HierarchicalInspectionResponseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a HierarchicalInspectionResponse.
     * @param {HierarchicalInspectionResponseDeleteArgs} args - Arguments to delete one HierarchicalInspectionResponse.
     * @example
     * // Delete one HierarchicalInspectionResponse
     * const HierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.delete({
     *   where: {
     *     // ... filter to delete one HierarchicalInspectionResponse
     *   }
     * })
     * 
     */
    delete<T extends HierarchicalInspectionResponseDeleteArgs>(args: SelectSubset<T, HierarchicalInspectionResponseDeleteArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one HierarchicalInspectionResponse.
     * @param {HierarchicalInspectionResponseUpdateArgs} args - Arguments to update one HierarchicalInspectionResponse.
     * @example
     * // Update one HierarchicalInspectionResponse
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HierarchicalInspectionResponseUpdateArgs>(args: SelectSubset<T, HierarchicalInspectionResponseUpdateArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more HierarchicalInspectionResponses.
     * @param {HierarchicalInspectionResponseDeleteManyArgs} args - Arguments to filter HierarchicalInspectionResponses to delete.
     * @example
     * // Delete a few HierarchicalInspectionResponses
     * const { count } = await prisma.hierarchicalInspectionResponse.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HierarchicalInspectionResponseDeleteManyArgs>(args?: SelectSubset<T, HierarchicalInspectionResponseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HierarchicalInspectionResponses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionResponseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HierarchicalInspectionResponses
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HierarchicalInspectionResponseUpdateManyArgs>(args: SelectSubset<T, HierarchicalInspectionResponseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one HierarchicalInspectionResponse.
     * @param {HierarchicalInspectionResponseUpsertArgs} args - Arguments to update or create a HierarchicalInspectionResponse.
     * @example
     * // Update or create a HierarchicalInspectionResponse
     * const hierarchicalInspectionResponse = await prisma.hierarchicalInspectionResponse.upsert({
     *   create: {
     *     // ... data to create a HierarchicalInspectionResponse
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HierarchicalInspectionResponse we want to update
     *   }
     * })
     */
    upsert<T extends HierarchicalInspectionResponseUpsertArgs>(args: SelectSubset<T, HierarchicalInspectionResponseUpsertArgs<ExtArgs>>): Prisma__HierarchicalInspectionResponseClient<$Result.GetResult<Prisma.$HierarchicalInspectionResponsePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of HierarchicalInspectionResponses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionResponseCountArgs} args - Arguments to filter HierarchicalInspectionResponses to count.
     * @example
     * // Count the number of HierarchicalInspectionResponses
     * const count = await prisma.hierarchicalInspectionResponse.count({
     *   where: {
     *     // ... the filter for the HierarchicalInspectionResponses we want to count
     *   }
     * })
    **/
    count<T extends HierarchicalInspectionResponseCountArgs>(
      args?: Subset<T, HierarchicalInspectionResponseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HierarchicalInspectionResponseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HierarchicalInspectionResponse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionResponseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HierarchicalInspectionResponseAggregateArgs>(args: Subset<T, HierarchicalInspectionResponseAggregateArgs>): Prisma.PrismaPromise<GetHierarchicalInspectionResponseAggregateType<T>>

    /**
     * Group by HierarchicalInspectionResponse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HierarchicalInspectionResponseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HierarchicalInspectionResponseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HierarchicalInspectionResponseGroupByArgs['orderBy'] }
        : { orderBy?: HierarchicalInspectionResponseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HierarchicalInspectionResponseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHierarchicalInspectionResponseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HierarchicalInspectionResponse model
   */
  readonly fields: HierarchicalInspectionResponseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HierarchicalInspectionResponse.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HierarchicalInspectionResponseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    checklist<T extends HierarchicalInspectionChecklistDefaultArgs<ExtArgs> = {}>(args?: Subset<T, HierarchicalInspectionChecklistDefaultArgs<ExtArgs>>): Prisma__HierarchicalInspectionChecklistClient<$Result.GetResult<Prisma.$HierarchicalInspectionChecklistPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HierarchicalInspectionResponse model
   */ 
  interface HierarchicalInspectionResponseFieldRefs {
    readonly id: FieldRef<"HierarchicalInspectionResponse", 'String'>
    readonly checklistId: FieldRef<"HierarchicalInspectionResponse", 'String'>
    readonly categoryId: FieldRef<"HierarchicalInspectionResponse", 'String'>
    readonly itemId: FieldRef<"HierarchicalInspectionResponse", 'String'>
    readonly booleanValue: FieldRef<"HierarchicalInspectionResponse", 'Boolean'>
    readonly textValue: FieldRef<"HierarchicalInspectionResponse", 'String'>
    readonly createdAt: FieldRef<"HierarchicalInspectionResponse", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * HierarchicalInspectionResponse findUnique
   */
  export type HierarchicalInspectionResponseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionResponse to fetch.
     */
    where: HierarchicalInspectionResponseWhereUniqueInput
  }

  /**
   * HierarchicalInspectionResponse findUniqueOrThrow
   */
  export type HierarchicalInspectionResponseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionResponse to fetch.
     */
    where: HierarchicalInspectionResponseWhereUniqueInput
  }

  /**
   * HierarchicalInspectionResponse findFirst
   */
  export type HierarchicalInspectionResponseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionResponse to fetch.
     */
    where?: HierarchicalInspectionResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionResponses to fetch.
     */
    orderBy?: HierarchicalInspectionResponseOrderByWithRelationInput | HierarchicalInspectionResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HierarchicalInspectionResponses.
     */
    cursor?: HierarchicalInspectionResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HierarchicalInspectionResponses.
     */
    distinct?: HierarchicalInspectionResponseScalarFieldEnum | HierarchicalInspectionResponseScalarFieldEnum[]
  }

  /**
   * HierarchicalInspectionResponse findFirstOrThrow
   */
  export type HierarchicalInspectionResponseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionResponse to fetch.
     */
    where?: HierarchicalInspectionResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionResponses to fetch.
     */
    orderBy?: HierarchicalInspectionResponseOrderByWithRelationInput | HierarchicalInspectionResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HierarchicalInspectionResponses.
     */
    cursor?: HierarchicalInspectionResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HierarchicalInspectionResponses.
     */
    distinct?: HierarchicalInspectionResponseScalarFieldEnum | HierarchicalInspectionResponseScalarFieldEnum[]
  }

  /**
   * HierarchicalInspectionResponse findMany
   */
  export type HierarchicalInspectionResponseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * Filter, which HierarchicalInspectionResponses to fetch.
     */
    where?: HierarchicalInspectionResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HierarchicalInspectionResponses to fetch.
     */
    orderBy?: HierarchicalInspectionResponseOrderByWithRelationInput | HierarchicalInspectionResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HierarchicalInspectionResponses.
     */
    cursor?: HierarchicalInspectionResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HierarchicalInspectionResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HierarchicalInspectionResponses.
     */
    skip?: number
    distinct?: HierarchicalInspectionResponseScalarFieldEnum | HierarchicalInspectionResponseScalarFieldEnum[]
  }

  /**
   * HierarchicalInspectionResponse create
   */
  export type HierarchicalInspectionResponseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * The data needed to create a HierarchicalInspectionResponse.
     */
    data: XOR<HierarchicalInspectionResponseCreateInput, HierarchicalInspectionResponseUncheckedCreateInput>
  }

  /**
   * HierarchicalInspectionResponse createMany
   */
  export type HierarchicalInspectionResponseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HierarchicalInspectionResponses.
     */
    data: HierarchicalInspectionResponseCreateManyInput | HierarchicalInspectionResponseCreateManyInput[]
  }

  /**
   * HierarchicalInspectionResponse createManyAndReturn
   */
  export type HierarchicalInspectionResponseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many HierarchicalInspectionResponses.
     */
    data: HierarchicalInspectionResponseCreateManyInput | HierarchicalInspectionResponseCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * HierarchicalInspectionResponse update
   */
  export type HierarchicalInspectionResponseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * The data needed to update a HierarchicalInspectionResponse.
     */
    data: XOR<HierarchicalInspectionResponseUpdateInput, HierarchicalInspectionResponseUncheckedUpdateInput>
    /**
     * Choose, which HierarchicalInspectionResponse to update.
     */
    where: HierarchicalInspectionResponseWhereUniqueInput
  }

  /**
   * HierarchicalInspectionResponse updateMany
   */
  export type HierarchicalInspectionResponseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HierarchicalInspectionResponses.
     */
    data: XOR<HierarchicalInspectionResponseUpdateManyMutationInput, HierarchicalInspectionResponseUncheckedUpdateManyInput>
    /**
     * Filter which HierarchicalInspectionResponses to update
     */
    where?: HierarchicalInspectionResponseWhereInput
  }

  /**
   * HierarchicalInspectionResponse upsert
   */
  export type HierarchicalInspectionResponseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * The filter to search for the HierarchicalInspectionResponse to update in case it exists.
     */
    where: HierarchicalInspectionResponseWhereUniqueInput
    /**
     * In case the HierarchicalInspectionResponse found by the `where` argument doesn't exist, create a new HierarchicalInspectionResponse with this data.
     */
    create: XOR<HierarchicalInspectionResponseCreateInput, HierarchicalInspectionResponseUncheckedCreateInput>
    /**
     * In case the HierarchicalInspectionResponse was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HierarchicalInspectionResponseUpdateInput, HierarchicalInspectionResponseUncheckedUpdateInput>
  }

  /**
   * HierarchicalInspectionResponse delete
   */
  export type HierarchicalInspectionResponseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
    /**
     * Filter which HierarchicalInspectionResponse to delete.
     */
    where: HierarchicalInspectionResponseWhereUniqueInput
  }

  /**
   * HierarchicalInspectionResponse deleteMany
   */
  export type HierarchicalInspectionResponseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HierarchicalInspectionResponses to delete
     */
    where?: HierarchicalInspectionResponseWhereInput
  }

  /**
   * HierarchicalInspectionResponse without action
   */
  export type HierarchicalInspectionResponseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HierarchicalInspectionResponse
     */
    select?: HierarchicalInspectionResponseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HierarchicalInspectionResponseInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    email: 'email',
    fullName: 'fullName',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    sku: 'sku',
    category: 'category',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const DeliveryPlanProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    category: 'category',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DeliveryPlanProductScalarFieldEnum = (typeof DeliveryPlanProductScalarFieldEnum)[keyof typeof DeliveryPlanProductScalarFieldEnum]


  export const HierarchicalInspectionChecklistScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    deliveryPlanProductId: 'deliveryPlanProductId',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    verifiedBy: 'verifiedBy',
    verifiedAt: 'verifiedAt',
    updatedBy: 'updatedBy',
    updatedAt: 'updatedAt',
    notes: 'notes'
  };

  export type HierarchicalInspectionChecklistScalarFieldEnum = (typeof HierarchicalInspectionChecklistScalarFieldEnum)[keyof typeof HierarchicalInspectionChecklistScalarFieldEnum]


  export const HierarchicalInspectionResponseScalarFieldEnum: {
    id: 'id',
    checklistId: 'checklistId',
    categoryId: 'categoryId',
    itemId: 'itemId',
    booleanValue: 'booleanValue',
    textValue: 'textValue',
    createdAt: 'createdAt'
  };

  export type HierarchicalInspectionResponseScalarFieldEnum = (typeof HierarchicalInspectionResponseScalarFieldEnum)[keyof typeof HierarchicalInspectionResponseScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    username?: StringNullableFilter<"User"> | string | null
    email?: StringFilter<"User"> | string
    fullName?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    hierarchicalInspectionChecklists?: HierarchicalInspectionChecklistListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrderInput | SortOrder
    email?: SortOrder
    fullName?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    hierarchicalInspectionChecklists?: HierarchicalInspectionChecklistOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    fullName?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    hierarchicalInspectionChecklists?: HierarchicalInspectionChecklistListRelationFilter
  }, "id" | "username" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrderInput | SortOrder
    email?: SortOrder
    fullName?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    username?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringWithAggregatesFilter<"User"> | string
    fullName?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    sku?: StringFilter<"Product"> | string
    category?: StringFilter<"Product"> | string
    status?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    hierarchicalInspectionChecklist?: XOR<HierarchicalInspectionChecklistNullableRelationFilter, HierarchicalInspectionChecklistWhereInput> | null
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    sku?: SortOrder
    category?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistOrderByWithRelationInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sku?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    category?: StringFilter<"Product"> | string
    status?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    hierarchicalInspectionChecklist?: XOR<HierarchicalInspectionChecklistNullableRelationFilter, HierarchicalInspectionChecklistWhereInput> | null
  }, "id" | "sku">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    sku?: SortOrder
    category?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    sku?: StringWithAggregatesFilter<"Product"> | string
    category?: StringWithAggregatesFilter<"Product"> | string
    status?: StringWithAggregatesFilter<"Product"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type DeliveryPlanProductWhereInput = {
    AND?: DeliveryPlanProductWhereInput | DeliveryPlanProductWhereInput[]
    OR?: DeliveryPlanProductWhereInput[]
    NOT?: DeliveryPlanProductWhereInput | DeliveryPlanProductWhereInput[]
    id?: StringFilter<"DeliveryPlanProduct"> | string
    name?: StringFilter<"DeliveryPlanProduct"> | string
    category?: StringFilter<"DeliveryPlanProduct"> | string
    createdAt?: DateTimeFilter<"DeliveryPlanProduct"> | Date | string
    updatedAt?: DateTimeFilter<"DeliveryPlanProduct"> | Date | string
    hierarchicalInspectionChecklist?: XOR<HierarchicalInspectionChecklistNullableRelationFilter, HierarchicalInspectionChecklistWhereInput> | null
  }

  export type DeliveryPlanProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistOrderByWithRelationInput
  }

  export type DeliveryPlanProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeliveryPlanProductWhereInput | DeliveryPlanProductWhereInput[]
    OR?: DeliveryPlanProductWhereInput[]
    NOT?: DeliveryPlanProductWhereInput | DeliveryPlanProductWhereInput[]
    name?: StringFilter<"DeliveryPlanProduct"> | string
    category?: StringFilter<"DeliveryPlanProduct"> | string
    createdAt?: DateTimeFilter<"DeliveryPlanProduct"> | Date | string
    updatedAt?: DateTimeFilter<"DeliveryPlanProduct"> | Date | string
    hierarchicalInspectionChecklist?: XOR<HierarchicalInspectionChecklistNullableRelationFilter, HierarchicalInspectionChecklistWhereInput> | null
  }, "id">

  export type DeliveryPlanProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DeliveryPlanProductCountOrderByAggregateInput
    _max?: DeliveryPlanProductMaxOrderByAggregateInput
    _min?: DeliveryPlanProductMinOrderByAggregateInput
  }

  export type DeliveryPlanProductScalarWhereWithAggregatesInput = {
    AND?: DeliveryPlanProductScalarWhereWithAggregatesInput | DeliveryPlanProductScalarWhereWithAggregatesInput[]
    OR?: DeliveryPlanProductScalarWhereWithAggregatesInput[]
    NOT?: DeliveryPlanProductScalarWhereWithAggregatesInput | DeliveryPlanProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeliveryPlanProduct"> | string
    name?: StringWithAggregatesFilter<"DeliveryPlanProduct"> | string
    category?: StringWithAggregatesFilter<"DeliveryPlanProduct"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DeliveryPlanProduct"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DeliveryPlanProduct"> | Date | string
  }

  export type HierarchicalInspectionChecklistWhereInput = {
    AND?: HierarchicalInspectionChecklistWhereInput | HierarchicalInspectionChecklistWhereInput[]
    OR?: HierarchicalInspectionChecklistWhereInput[]
    NOT?: HierarchicalInspectionChecklistWhereInput | HierarchicalInspectionChecklistWhereInput[]
    id?: StringFilter<"HierarchicalInspectionChecklist"> | string
    productId?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    deliveryPlanProductId?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    createdBy?: StringFilter<"HierarchicalInspectionChecklist"> | string
    createdAt?: DateTimeFilter<"HierarchicalInspectionChecklist"> | Date | string
    verifiedBy?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    verifiedAt?: DateTimeNullableFilter<"HierarchicalInspectionChecklist"> | Date | string | null
    updatedBy?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    updatedAt?: DateTimeFilter<"HierarchicalInspectionChecklist"> | Date | string
    notes?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    responses?: HierarchicalInspectionResponseListRelationFilter
    product?: XOR<ProductNullableRelationFilter, ProductWhereInput> | null
    deliveryPlanProduct?: XOR<DeliveryPlanProductNullableRelationFilter, DeliveryPlanProductWhereInput> | null
    createdByUser?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type HierarchicalInspectionChecklistOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrderInput | SortOrder
    deliveryPlanProductId?: SortOrderInput | SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    verifiedBy?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    responses?: HierarchicalInspectionResponseOrderByRelationAggregateInput
    product?: ProductOrderByWithRelationInput
    deliveryPlanProduct?: DeliveryPlanProductOrderByWithRelationInput
    createdByUser?: UserOrderByWithRelationInput
  }

  export type HierarchicalInspectionChecklistWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productId?: string
    deliveryPlanProductId?: string
    AND?: HierarchicalInspectionChecklistWhereInput | HierarchicalInspectionChecklistWhereInput[]
    OR?: HierarchicalInspectionChecklistWhereInput[]
    NOT?: HierarchicalInspectionChecklistWhereInput | HierarchicalInspectionChecklistWhereInput[]
    createdBy?: StringFilter<"HierarchicalInspectionChecklist"> | string
    createdAt?: DateTimeFilter<"HierarchicalInspectionChecklist"> | Date | string
    verifiedBy?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    verifiedAt?: DateTimeNullableFilter<"HierarchicalInspectionChecklist"> | Date | string | null
    updatedBy?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    updatedAt?: DateTimeFilter<"HierarchicalInspectionChecklist"> | Date | string
    notes?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    responses?: HierarchicalInspectionResponseListRelationFilter
    product?: XOR<ProductNullableRelationFilter, ProductWhereInput> | null
    deliveryPlanProduct?: XOR<DeliveryPlanProductNullableRelationFilter, DeliveryPlanProductWhereInput> | null
    createdByUser?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "productId" | "deliveryPlanProductId">

  export type HierarchicalInspectionChecklistOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrderInput | SortOrder
    deliveryPlanProductId?: SortOrderInput | SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    verifiedBy?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    _count?: HierarchicalInspectionChecklistCountOrderByAggregateInput
    _max?: HierarchicalInspectionChecklistMaxOrderByAggregateInput
    _min?: HierarchicalInspectionChecklistMinOrderByAggregateInput
  }

  export type HierarchicalInspectionChecklistScalarWhereWithAggregatesInput = {
    AND?: HierarchicalInspectionChecklistScalarWhereWithAggregatesInput | HierarchicalInspectionChecklistScalarWhereWithAggregatesInput[]
    OR?: HierarchicalInspectionChecklistScalarWhereWithAggregatesInput[]
    NOT?: HierarchicalInspectionChecklistScalarWhereWithAggregatesInput | HierarchicalInspectionChecklistScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HierarchicalInspectionChecklist"> | string
    productId?: StringNullableWithAggregatesFilter<"HierarchicalInspectionChecklist"> | string | null
    deliveryPlanProductId?: StringNullableWithAggregatesFilter<"HierarchicalInspectionChecklist"> | string | null
    createdBy?: StringWithAggregatesFilter<"HierarchicalInspectionChecklist"> | string
    createdAt?: DateTimeWithAggregatesFilter<"HierarchicalInspectionChecklist"> | Date | string
    verifiedBy?: StringNullableWithAggregatesFilter<"HierarchicalInspectionChecklist"> | string | null
    verifiedAt?: DateTimeNullableWithAggregatesFilter<"HierarchicalInspectionChecklist"> | Date | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"HierarchicalInspectionChecklist"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"HierarchicalInspectionChecklist"> | Date | string
    notes?: StringNullableWithAggregatesFilter<"HierarchicalInspectionChecklist"> | string | null
  }

  export type HierarchicalInspectionResponseWhereInput = {
    AND?: HierarchicalInspectionResponseWhereInput | HierarchicalInspectionResponseWhereInput[]
    OR?: HierarchicalInspectionResponseWhereInput[]
    NOT?: HierarchicalInspectionResponseWhereInput | HierarchicalInspectionResponseWhereInput[]
    id?: StringFilter<"HierarchicalInspectionResponse"> | string
    checklistId?: StringFilter<"HierarchicalInspectionResponse"> | string
    categoryId?: StringFilter<"HierarchicalInspectionResponse"> | string
    itemId?: StringFilter<"HierarchicalInspectionResponse"> | string
    booleanValue?: BoolNullableFilter<"HierarchicalInspectionResponse"> | boolean | null
    textValue?: StringNullableFilter<"HierarchicalInspectionResponse"> | string | null
    createdAt?: DateTimeFilter<"HierarchicalInspectionResponse"> | Date | string
    checklist?: XOR<HierarchicalInspectionChecklistRelationFilter, HierarchicalInspectionChecklistWhereInput>
  }

  export type HierarchicalInspectionResponseOrderByWithRelationInput = {
    id?: SortOrder
    checklistId?: SortOrder
    categoryId?: SortOrder
    itemId?: SortOrder
    booleanValue?: SortOrderInput | SortOrder
    textValue?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    checklist?: HierarchicalInspectionChecklistOrderByWithRelationInput
  }

  export type HierarchicalInspectionResponseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    checklistId_categoryId_itemId?: HierarchicalInspectionResponseChecklistIdCategoryIdItemIdCompoundUniqueInput
    AND?: HierarchicalInspectionResponseWhereInput | HierarchicalInspectionResponseWhereInput[]
    OR?: HierarchicalInspectionResponseWhereInput[]
    NOT?: HierarchicalInspectionResponseWhereInput | HierarchicalInspectionResponseWhereInput[]
    checklistId?: StringFilter<"HierarchicalInspectionResponse"> | string
    categoryId?: StringFilter<"HierarchicalInspectionResponse"> | string
    itemId?: StringFilter<"HierarchicalInspectionResponse"> | string
    booleanValue?: BoolNullableFilter<"HierarchicalInspectionResponse"> | boolean | null
    textValue?: StringNullableFilter<"HierarchicalInspectionResponse"> | string | null
    createdAt?: DateTimeFilter<"HierarchicalInspectionResponse"> | Date | string
    checklist?: XOR<HierarchicalInspectionChecklistRelationFilter, HierarchicalInspectionChecklistWhereInput>
  }, "id" | "checklistId_categoryId_itemId">

  export type HierarchicalInspectionResponseOrderByWithAggregationInput = {
    id?: SortOrder
    checklistId?: SortOrder
    categoryId?: SortOrder
    itemId?: SortOrder
    booleanValue?: SortOrderInput | SortOrder
    textValue?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: HierarchicalInspectionResponseCountOrderByAggregateInput
    _max?: HierarchicalInspectionResponseMaxOrderByAggregateInput
    _min?: HierarchicalInspectionResponseMinOrderByAggregateInput
  }

  export type HierarchicalInspectionResponseScalarWhereWithAggregatesInput = {
    AND?: HierarchicalInspectionResponseScalarWhereWithAggregatesInput | HierarchicalInspectionResponseScalarWhereWithAggregatesInput[]
    OR?: HierarchicalInspectionResponseScalarWhereWithAggregatesInput[]
    NOT?: HierarchicalInspectionResponseScalarWhereWithAggregatesInput | HierarchicalInspectionResponseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HierarchicalInspectionResponse"> | string
    checklistId?: StringWithAggregatesFilter<"HierarchicalInspectionResponse"> | string
    categoryId?: StringWithAggregatesFilter<"HierarchicalInspectionResponse"> | string
    itemId?: StringWithAggregatesFilter<"HierarchicalInspectionResponse"> | string
    booleanValue?: BoolNullableWithAggregatesFilter<"HierarchicalInspectionResponse"> | boolean | null
    textValue?: StringNullableWithAggregatesFilter<"HierarchicalInspectionResponse"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"HierarchicalInspectionResponse"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    username?: string | null
    email: string
    fullName?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    hierarchicalInspectionChecklists?: HierarchicalInspectionChecklistCreateNestedManyWithoutCreatedByUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    username?: string | null
    email: string
    fullName?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    hierarchicalInspectionChecklists?: HierarchicalInspectionChecklistUncheckedCreateNestedManyWithoutCreatedByUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hierarchicalInspectionChecklists?: HierarchicalInspectionChecklistUpdateManyWithoutCreatedByUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hierarchicalInspectionChecklists?: HierarchicalInspectionChecklistUncheckedUpdateManyWithoutCreatedByUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    username?: string | null
    email: string
    fullName?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
    id?: string
    name: string
    sku: string
    category: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistCreateNestedOneWithoutProductInput
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    name: string
    sku: string
    category: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistUncheckedCreateNestedOneWithoutProductInput
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistUpdateOneWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistUncheckedUpdateOneWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: string
    name: string
    sku: string
    category: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryPlanProductCreateInput = {
    id?: string
    name: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistCreateNestedOneWithoutDeliveryPlanProductInput
  }

  export type DeliveryPlanProductUncheckedCreateInput = {
    id?: string
    name: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistUncheckedCreateNestedOneWithoutDeliveryPlanProductInput
  }

  export type DeliveryPlanProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistUpdateOneWithoutDeliveryPlanProductNestedInput
  }

  export type DeliveryPlanProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hierarchicalInspectionChecklist?: HierarchicalInspectionChecklistUncheckedUpdateOneWithoutDeliveryPlanProductNestedInput
  }

  export type DeliveryPlanProductCreateManyInput = {
    id?: string
    name: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DeliveryPlanProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryPlanProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HierarchicalInspectionChecklistCreateInput = {
    id?: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseCreateNestedManyWithoutChecklistInput
    product?: ProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
    deliveryPlanProduct?: DeliveryPlanProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
    createdByUser: UserCreateNestedOneWithoutHierarchicalInspectionChecklistsInput
  }

  export type HierarchicalInspectionChecklistUncheckedCreateInput = {
    id?: string
    productId?: string | null
    deliveryPlanProductId?: string | null
    createdBy: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseUncheckedCreateNestedManyWithoutChecklistInput
  }

  export type HierarchicalInspectionChecklistUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUpdateManyWithoutChecklistNestedInput
    product?: ProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
    deliveryPlanProduct?: DeliveryPlanProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
    createdByUser?: UserUpdateOneRequiredWithoutHierarchicalInspectionChecklistsNestedInput
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPlanProductId?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUncheckedUpdateManyWithoutChecklistNestedInput
  }

  export type HierarchicalInspectionChecklistCreateManyInput = {
    id?: string
    productId?: string | null
    deliveryPlanProductId?: string | null
    createdBy: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
  }

  export type HierarchicalInspectionChecklistUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPlanProductId?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HierarchicalInspectionResponseCreateInput = {
    id?: string
    categoryId: string
    itemId: string
    booleanValue?: boolean | null
    textValue?: string | null
    createdAt?: Date | string
    checklist: HierarchicalInspectionChecklistCreateNestedOneWithoutResponsesInput
  }

  export type HierarchicalInspectionResponseUncheckedCreateInput = {
    id?: string
    checklistId: string
    categoryId: string
    itemId: string
    booleanValue?: boolean | null
    textValue?: string | null
    createdAt?: Date | string
  }

  export type HierarchicalInspectionResponseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    booleanValue?: NullableBoolFieldUpdateOperationsInput | boolean | null
    textValue?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checklist?: HierarchicalInspectionChecklistUpdateOneRequiredWithoutResponsesNestedInput
  }

  export type HierarchicalInspectionResponseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    checklistId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    booleanValue?: NullableBoolFieldUpdateOperationsInput | boolean | null
    textValue?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HierarchicalInspectionResponseCreateManyInput = {
    id?: string
    checklistId: string
    categoryId: string
    itemId: string
    booleanValue?: boolean | null
    textValue?: string | null
    createdAt?: Date | string
  }

  export type HierarchicalInspectionResponseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    booleanValue?: NullableBoolFieldUpdateOperationsInput | boolean | null
    textValue?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HierarchicalInspectionResponseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    checklistId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    booleanValue?: NullableBoolFieldUpdateOperationsInput | boolean | null
    textValue?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type HierarchicalInspectionChecklistListRelationFilter = {
    every?: HierarchicalInspectionChecklistWhereInput
    some?: HierarchicalInspectionChecklistWhereInput
    none?: HierarchicalInspectionChecklistWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type HierarchicalInspectionChecklistOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type HierarchicalInspectionChecklistNullableRelationFilter = {
    is?: HierarchicalInspectionChecklistWhereInput | null
    isNot?: HierarchicalInspectionChecklistWhereInput | null
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sku?: SortOrder
    category?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sku?: SortOrder
    category?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sku?: SortOrder
    category?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DeliveryPlanProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DeliveryPlanProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DeliveryPlanProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type HierarchicalInspectionResponseListRelationFilter = {
    every?: HierarchicalInspectionResponseWhereInput
    some?: HierarchicalInspectionResponseWhereInput
    none?: HierarchicalInspectionResponseWhereInput
  }

  export type ProductNullableRelationFilter = {
    is?: ProductWhereInput | null
    isNot?: ProductWhereInput | null
  }

  export type DeliveryPlanProductNullableRelationFilter = {
    is?: DeliveryPlanProductWhereInput | null
    isNot?: DeliveryPlanProductWhereInput | null
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type HierarchicalInspectionResponseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HierarchicalInspectionChecklistCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    deliveryPlanProductId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    verifiedBy?: SortOrder
    verifiedAt?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    notes?: SortOrder
  }

  export type HierarchicalInspectionChecklistMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    deliveryPlanProductId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    verifiedBy?: SortOrder
    verifiedAt?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    notes?: SortOrder
  }

  export type HierarchicalInspectionChecklistMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    deliveryPlanProductId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    verifiedBy?: SortOrder
    verifiedAt?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    notes?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type HierarchicalInspectionChecklistRelationFilter = {
    is?: HierarchicalInspectionChecklistWhereInput
    isNot?: HierarchicalInspectionChecklistWhereInput
  }

  export type HierarchicalInspectionResponseChecklistIdCategoryIdItemIdCompoundUniqueInput = {
    checklistId: string
    categoryId: string
    itemId: string
  }

  export type HierarchicalInspectionResponseCountOrderByAggregateInput = {
    id?: SortOrder
    checklistId?: SortOrder
    categoryId?: SortOrder
    itemId?: SortOrder
    booleanValue?: SortOrder
    textValue?: SortOrder
    createdAt?: SortOrder
  }

  export type HierarchicalInspectionResponseMaxOrderByAggregateInput = {
    id?: SortOrder
    checklistId?: SortOrder
    categoryId?: SortOrder
    itemId?: SortOrder
    booleanValue?: SortOrder
    textValue?: SortOrder
    createdAt?: SortOrder
  }

  export type HierarchicalInspectionResponseMinOrderByAggregateInput = {
    id?: SortOrder
    checklistId?: SortOrder
    categoryId?: SortOrder
    itemId?: SortOrder
    booleanValue?: SortOrder
    textValue?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type HierarchicalInspectionChecklistCreateNestedManyWithoutCreatedByUserInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput> | HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput[] | HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput[]
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput | HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput[]
    createMany?: HierarchicalInspectionChecklistCreateManyCreatedByUserInputEnvelope
    connect?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
  }

  export type HierarchicalInspectionChecklistUncheckedCreateNestedManyWithoutCreatedByUserInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput> | HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput[] | HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput[]
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput | HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput[]
    createMany?: HierarchicalInspectionChecklistCreateManyCreatedByUserInputEnvelope
    connect?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type HierarchicalInspectionChecklistUpdateManyWithoutCreatedByUserNestedInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput> | HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput[] | HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput[]
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput | HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput[]
    upsert?: HierarchicalInspectionChecklistUpsertWithWhereUniqueWithoutCreatedByUserInput | HierarchicalInspectionChecklistUpsertWithWhereUniqueWithoutCreatedByUserInput[]
    createMany?: HierarchicalInspectionChecklistCreateManyCreatedByUserInputEnvelope
    set?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    disconnect?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    delete?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    connect?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    update?: HierarchicalInspectionChecklistUpdateWithWhereUniqueWithoutCreatedByUserInput | HierarchicalInspectionChecklistUpdateWithWhereUniqueWithoutCreatedByUserInput[]
    updateMany?: HierarchicalInspectionChecklistUpdateManyWithWhereWithoutCreatedByUserInput | HierarchicalInspectionChecklistUpdateManyWithWhereWithoutCreatedByUserInput[]
    deleteMany?: HierarchicalInspectionChecklistScalarWhereInput | HierarchicalInspectionChecklistScalarWhereInput[]
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateManyWithoutCreatedByUserNestedInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput> | HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput[] | HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput[]
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput | HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput[]
    upsert?: HierarchicalInspectionChecklistUpsertWithWhereUniqueWithoutCreatedByUserInput | HierarchicalInspectionChecklistUpsertWithWhereUniqueWithoutCreatedByUserInput[]
    createMany?: HierarchicalInspectionChecklistCreateManyCreatedByUserInputEnvelope
    set?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    disconnect?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    delete?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    connect?: HierarchicalInspectionChecklistWhereUniqueInput | HierarchicalInspectionChecklistWhereUniqueInput[]
    update?: HierarchicalInspectionChecklistUpdateWithWhereUniqueWithoutCreatedByUserInput | HierarchicalInspectionChecklistUpdateWithWhereUniqueWithoutCreatedByUserInput[]
    updateMany?: HierarchicalInspectionChecklistUpdateManyWithWhereWithoutCreatedByUserInput | HierarchicalInspectionChecklistUpdateManyWithWhereWithoutCreatedByUserInput[]
    deleteMany?: HierarchicalInspectionChecklistScalarWhereInput | HierarchicalInspectionChecklistScalarWhereInput[]
  }

  export type HierarchicalInspectionChecklistCreateNestedOneWithoutProductInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutProductInput
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
  }

  export type HierarchicalInspectionChecklistUncheckedCreateNestedOneWithoutProductInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutProductInput
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
  }

  export type HierarchicalInspectionChecklistUpdateOneWithoutProductNestedInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutProductInput
    upsert?: HierarchicalInspectionChecklistUpsertWithoutProductInput
    disconnect?: HierarchicalInspectionChecklistWhereInput | boolean
    delete?: HierarchicalInspectionChecklistWhereInput | boolean
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
    update?: XOR<XOR<HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutProductInput, HierarchicalInspectionChecklistUpdateWithoutProductInput>, HierarchicalInspectionChecklistUncheckedUpdateWithoutProductInput>
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateOneWithoutProductNestedInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutProductInput
    upsert?: HierarchicalInspectionChecklistUpsertWithoutProductInput
    disconnect?: HierarchicalInspectionChecklistWhereInput | boolean
    delete?: HierarchicalInspectionChecklistWhereInput | boolean
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
    update?: XOR<XOR<HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutProductInput, HierarchicalInspectionChecklistUpdateWithoutProductInput>, HierarchicalInspectionChecklistUncheckedUpdateWithoutProductInput>
  }

  export type HierarchicalInspectionChecklistCreateNestedOneWithoutDeliveryPlanProductInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutDeliveryPlanProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutDeliveryPlanProductInput
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
  }

  export type HierarchicalInspectionChecklistUncheckedCreateNestedOneWithoutDeliveryPlanProductInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutDeliveryPlanProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutDeliveryPlanProductInput
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
  }

  export type HierarchicalInspectionChecklistUpdateOneWithoutDeliveryPlanProductNestedInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutDeliveryPlanProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutDeliveryPlanProductInput
    upsert?: HierarchicalInspectionChecklistUpsertWithoutDeliveryPlanProductInput
    disconnect?: HierarchicalInspectionChecklistWhereInput | boolean
    delete?: HierarchicalInspectionChecklistWhereInput | boolean
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
    update?: XOR<XOR<HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUpdateWithoutDeliveryPlanProductInput>, HierarchicalInspectionChecklistUncheckedUpdateWithoutDeliveryPlanProductInput>
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateOneWithoutDeliveryPlanProductNestedInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutDeliveryPlanProductInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutDeliveryPlanProductInput
    upsert?: HierarchicalInspectionChecklistUpsertWithoutDeliveryPlanProductInput
    disconnect?: HierarchicalInspectionChecklistWhereInput | boolean
    delete?: HierarchicalInspectionChecklistWhereInput | boolean
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
    update?: XOR<XOR<HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUpdateWithoutDeliveryPlanProductInput>, HierarchicalInspectionChecklistUncheckedUpdateWithoutDeliveryPlanProductInput>
  }

  export type HierarchicalInspectionResponseCreateNestedManyWithoutChecklistInput = {
    create?: XOR<HierarchicalInspectionResponseCreateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput> | HierarchicalInspectionResponseCreateWithoutChecklistInput[] | HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput[]
    connectOrCreate?: HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput | HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput[]
    createMany?: HierarchicalInspectionResponseCreateManyChecklistInputEnvelope
    connect?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
  }

  export type ProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput = {
    create?: XOR<ProductCreateWithoutHierarchicalInspectionChecklistInput, ProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
    connectOrCreate?: ProductCreateOrConnectWithoutHierarchicalInspectionChecklistInput
    connect?: ProductWhereUniqueInput
  }

  export type DeliveryPlanProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput = {
    create?: XOR<DeliveryPlanProductCreateWithoutHierarchicalInspectionChecklistInput, DeliveryPlanProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
    connectOrCreate?: DeliveryPlanProductCreateOrConnectWithoutHierarchicalInspectionChecklistInput
    connect?: DeliveryPlanProductWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutHierarchicalInspectionChecklistsInput = {
    create?: XOR<UserCreateWithoutHierarchicalInspectionChecklistsInput, UserUncheckedCreateWithoutHierarchicalInspectionChecklistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutHierarchicalInspectionChecklistsInput
    connect?: UserWhereUniqueInput
  }

  export type HierarchicalInspectionResponseUncheckedCreateNestedManyWithoutChecklistInput = {
    create?: XOR<HierarchicalInspectionResponseCreateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput> | HierarchicalInspectionResponseCreateWithoutChecklistInput[] | HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput[]
    connectOrCreate?: HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput | HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput[]
    createMany?: HierarchicalInspectionResponseCreateManyChecklistInputEnvelope
    connect?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type HierarchicalInspectionResponseUpdateManyWithoutChecklistNestedInput = {
    create?: XOR<HierarchicalInspectionResponseCreateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput> | HierarchicalInspectionResponseCreateWithoutChecklistInput[] | HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput[]
    connectOrCreate?: HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput | HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput[]
    upsert?: HierarchicalInspectionResponseUpsertWithWhereUniqueWithoutChecklistInput | HierarchicalInspectionResponseUpsertWithWhereUniqueWithoutChecklistInput[]
    createMany?: HierarchicalInspectionResponseCreateManyChecklistInputEnvelope
    set?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    disconnect?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    delete?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    connect?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    update?: HierarchicalInspectionResponseUpdateWithWhereUniqueWithoutChecklistInput | HierarchicalInspectionResponseUpdateWithWhereUniqueWithoutChecklistInput[]
    updateMany?: HierarchicalInspectionResponseUpdateManyWithWhereWithoutChecklistInput | HierarchicalInspectionResponseUpdateManyWithWhereWithoutChecklistInput[]
    deleteMany?: HierarchicalInspectionResponseScalarWhereInput | HierarchicalInspectionResponseScalarWhereInput[]
  }

  export type ProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput = {
    create?: XOR<ProductCreateWithoutHierarchicalInspectionChecklistInput, ProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
    connectOrCreate?: ProductCreateOrConnectWithoutHierarchicalInspectionChecklistInput
    upsert?: ProductUpsertWithoutHierarchicalInspectionChecklistInput
    disconnect?: ProductWhereInput | boolean
    delete?: ProductWhereInput | boolean
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutHierarchicalInspectionChecklistInput, ProductUpdateWithoutHierarchicalInspectionChecklistInput>, ProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput>
  }

  export type DeliveryPlanProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput = {
    create?: XOR<DeliveryPlanProductCreateWithoutHierarchicalInspectionChecklistInput, DeliveryPlanProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
    connectOrCreate?: DeliveryPlanProductCreateOrConnectWithoutHierarchicalInspectionChecklistInput
    upsert?: DeliveryPlanProductUpsertWithoutHierarchicalInspectionChecklistInput
    disconnect?: DeliveryPlanProductWhereInput | boolean
    delete?: DeliveryPlanProductWhereInput | boolean
    connect?: DeliveryPlanProductWhereUniqueInput
    update?: XOR<XOR<DeliveryPlanProductUpdateToOneWithWhereWithoutHierarchicalInspectionChecklistInput, DeliveryPlanProductUpdateWithoutHierarchicalInspectionChecklistInput>, DeliveryPlanProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput>
  }

  export type UserUpdateOneRequiredWithoutHierarchicalInspectionChecklistsNestedInput = {
    create?: XOR<UserCreateWithoutHierarchicalInspectionChecklistsInput, UserUncheckedCreateWithoutHierarchicalInspectionChecklistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutHierarchicalInspectionChecklistsInput
    upsert?: UserUpsertWithoutHierarchicalInspectionChecklistsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutHierarchicalInspectionChecklistsInput, UserUpdateWithoutHierarchicalInspectionChecklistsInput>, UserUncheckedUpdateWithoutHierarchicalInspectionChecklistsInput>
  }

  export type HierarchicalInspectionResponseUncheckedUpdateManyWithoutChecklistNestedInput = {
    create?: XOR<HierarchicalInspectionResponseCreateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput> | HierarchicalInspectionResponseCreateWithoutChecklistInput[] | HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput[]
    connectOrCreate?: HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput | HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput[]
    upsert?: HierarchicalInspectionResponseUpsertWithWhereUniqueWithoutChecklistInput | HierarchicalInspectionResponseUpsertWithWhereUniqueWithoutChecklistInput[]
    createMany?: HierarchicalInspectionResponseCreateManyChecklistInputEnvelope
    set?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    disconnect?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    delete?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    connect?: HierarchicalInspectionResponseWhereUniqueInput | HierarchicalInspectionResponseWhereUniqueInput[]
    update?: HierarchicalInspectionResponseUpdateWithWhereUniqueWithoutChecklistInput | HierarchicalInspectionResponseUpdateWithWhereUniqueWithoutChecklistInput[]
    updateMany?: HierarchicalInspectionResponseUpdateManyWithWhereWithoutChecklistInput | HierarchicalInspectionResponseUpdateManyWithWhereWithoutChecklistInput[]
    deleteMany?: HierarchicalInspectionResponseScalarWhereInput | HierarchicalInspectionResponseScalarWhereInput[]
  }

  export type HierarchicalInspectionChecklistCreateNestedOneWithoutResponsesInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutResponsesInput, HierarchicalInspectionChecklistUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutResponsesInput
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type HierarchicalInspectionChecklistUpdateOneRequiredWithoutResponsesNestedInput = {
    create?: XOR<HierarchicalInspectionChecklistCreateWithoutResponsesInput, HierarchicalInspectionChecklistUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: HierarchicalInspectionChecklistCreateOrConnectWithoutResponsesInput
    upsert?: HierarchicalInspectionChecklistUpsertWithoutResponsesInput
    connect?: HierarchicalInspectionChecklistWhereUniqueInput
    update?: XOR<XOR<HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutResponsesInput, HierarchicalInspectionChecklistUpdateWithoutResponsesInput>, HierarchicalInspectionChecklistUncheckedUpdateWithoutResponsesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput = {
    id?: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseCreateNestedManyWithoutChecklistInput
    product?: ProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
    deliveryPlanProduct?: DeliveryPlanProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
  }

  export type HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput = {
    id?: string
    productId?: string | null
    deliveryPlanProductId?: string | null
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseUncheckedCreateNestedManyWithoutChecklistInput
  }

  export type HierarchicalInspectionChecklistCreateOrConnectWithoutCreatedByUserInput = {
    where: HierarchicalInspectionChecklistWhereUniqueInput
    create: XOR<HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput>
  }

  export type HierarchicalInspectionChecklistCreateManyCreatedByUserInputEnvelope = {
    data: HierarchicalInspectionChecklistCreateManyCreatedByUserInput | HierarchicalInspectionChecklistCreateManyCreatedByUserInput[]
  }

  export type HierarchicalInspectionChecklistUpsertWithWhereUniqueWithoutCreatedByUserInput = {
    where: HierarchicalInspectionChecklistWhereUniqueInput
    update: XOR<HierarchicalInspectionChecklistUpdateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutCreatedByUserInput>
    create: XOR<HierarchicalInspectionChecklistCreateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedCreateWithoutCreatedByUserInput>
  }

  export type HierarchicalInspectionChecklistUpdateWithWhereUniqueWithoutCreatedByUserInput = {
    where: HierarchicalInspectionChecklistWhereUniqueInput
    data: XOR<HierarchicalInspectionChecklistUpdateWithoutCreatedByUserInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutCreatedByUserInput>
  }

  export type HierarchicalInspectionChecklistUpdateManyWithWhereWithoutCreatedByUserInput = {
    where: HierarchicalInspectionChecklistScalarWhereInput
    data: XOR<HierarchicalInspectionChecklistUpdateManyMutationInput, HierarchicalInspectionChecklistUncheckedUpdateManyWithoutCreatedByUserInput>
  }

  export type HierarchicalInspectionChecklistScalarWhereInput = {
    AND?: HierarchicalInspectionChecklistScalarWhereInput | HierarchicalInspectionChecklistScalarWhereInput[]
    OR?: HierarchicalInspectionChecklistScalarWhereInput[]
    NOT?: HierarchicalInspectionChecklistScalarWhereInput | HierarchicalInspectionChecklistScalarWhereInput[]
    id?: StringFilter<"HierarchicalInspectionChecklist"> | string
    productId?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    deliveryPlanProductId?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    createdBy?: StringFilter<"HierarchicalInspectionChecklist"> | string
    createdAt?: DateTimeFilter<"HierarchicalInspectionChecklist"> | Date | string
    verifiedBy?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    verifiedAt?: DateTimeNullableFilter<"HierarchicalInspectionChecklist"> | Date | string | null
    updatedBy?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
    updatedAt?: DateTimeFilter<"HierarchicalInspectionChecklist"> | Date | string
    notes?: StringNullableFilter<"HierarchicalInspectionChecklist"> | string | null
  }

  export type HierarchicalInspectionChecklistCreateWithoutProductInput = {
    id?: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseCreateNestedManyWithoutChecklistInput
    deliveryPlanProduct?: DeliveryPlanProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
    createdByUser: UserCreateNestedOneWithoutHierarchicalInspectionChecklistsInput
  }

  export type HierarchicalInspectionChecklistUncheckedCreateWithoutProductInput = {
    id?: string
    deliveryPlanProductId?: string | null
    createdBy: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseUncheckedCreateNestedManyWithoutChecklistInput
  }

  export type HierarchicalInspectionChecklistCreateOrConnectWithoutProductInput = {
    where: HierarchicalInspectionChecklistWhereUniqueInput
    create: XOR<HierarchicalInspectionChecklistCreateWithoutProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutProductInput>
  }

  export type HierarchicalInspectionChecklistUpsertWithoutProductInput = {
    update: XOR<HierarchicalInspectionChecklistUpdateWithoutProductInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutProductInput>
    create: XOR<HierarchicalInspectionChecklistCreateWithoutProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutProductInput>
    where?: HierarchicalInspectionChecklistWhereInput
  }

  export type HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutProductInput = {
    where?: HierarchicalInspectionChecklistWhereInput
    data: XOR<HierarchicalInspectionChecklistUpdateWithoutProductInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutProductInput>
  }

  export type HierarchicalInspectionChecklistUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUpdateManyWithoutChecklistNestedInput
    deliveryPlanProduct?: DeliveryPlanProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
    createdByUser?: UserUpdateOneRequiredWithoutHierarchicalInspectionChecklistsNestedInput
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    deliveryPlanProductId?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUncheckedUpdateManyWithoutChecklistNestedInput
  }

  export type HierarchicalInspectionChecklistCreateWithoutDeliveryPlanProductInput = {
    id?: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseCreateNestedManyWithoutChecklistInput
    product?: ProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
    createdByUser: UserCreateNestedOneWithoutHierarchicalInspectionChecklistsInput
  }

  export type HierarchicalInspectionChecklistUncheckedCreateWithoutDeliveryPlanProductInput = {
    id?: string
    productId?: string | null
    createdBy: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    responses?: HierarchicalInspectionResponseUncheckedCreateNestedManyWithoutChecklistInput
  }

  export type HierarchicalInspectionChecklistCreateOrConnectWithoutDeliveryPlanProductInput = {
    where: HierarchicalInspectionChecklistWhereUniqueInput
    create: XOR<HierarchicalInspectionChecklistCreateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutDeliveryPlanProductInput>
  }

  export type HierarchicalInspectionChecklistUpsertWithoutDeliveryPlanProductInput = {
    update: XOR<HierarchicalInspectionChecklistUpdateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutDeliveryPlanProductInput>
    create: XOR<HierarchicalInspectionChecklistCreateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedCreateWithoutDeliveryPlanProductInput>
    where?: HierarchicalInspectionChecklistWhereInput
  }

  export type HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutDeliveryPlanProductInput = {
    where?: HierarchicalInspectionChecklistWhereInput
    data: XOR<HierarchicalInspectionChecklistUpdateWithoutDeliveryPlanProductInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutDeliveryPlanProductInput>
  }

  export type HierarchicalInspectionChecklistUpdateWithoutDeliveryPlanProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUpdateManyWithoutChecklistNestedInput
    product?: ProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
    createdByUser?: UserUpdateOneRequiredWithoutHierarchicalInspectionChecklistsNestedInput
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateWithoutDeliveryPlanProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUncheckedUpdateManyWithoutChecklistNestedInput
  }

  export type HierarchicalInspectionResponseCreateWithoutChecklistInput = {
    id?: string
    categoryId: string
    itemId: string
    booleanValue?: boolean | null
    textValue?: string | null
    createdAt?: Date | string
  }

  export type HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput = {
    id?: string
    categoryId: string
    itemId: string
    booleanValue?: boolean | null
    textValue?: string | null
    createdAt?: Date | string
  }

  export type HierarchicalInspectionResponseCreateOrConnectWithoutChecklistInput = {
    where: HierarchicalInspectionResponseWhereUniqueInput
    create: XOR<HierarchicalInspectionResponseCreateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput>
  }

  export type HierarchicalInspectionResponseCreateManyChecklistInputEnvelope = {
    data: HierarchicalInspectionResponseCreateManyChecklistInput | HierarchicalInspectionResponseCreateManyChecklistInput[]
  }

  export type ProductCreateWithoutHierarchicalInspectionChecklistInput = {
    id?: string
    name: string
    sku: string
    category: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput = {
    id?: string
    name: string
    sku: string
    category: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateOrConnectWithoutHierarchicalInspectionChecklistInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutHierarchicalInspectionChecklistInput, ProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
  }

  export type DeliveryPlanProductCreateWithoutHierarchicalInspectionChecklistInput = {
    id?: string
    name: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DeliveryPlanProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput = {
    id?: string
    name: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DeliveryPlanProductCreateOrConnectWithoutHierarchicalInspectionChecklistInput = {
    where: DeliveryPlanProductWhereUniqueInput
    create: XOR<DeliveryPlanProductCreateWithoutHierarchicalInspectionChecklistInput, DeliveryPlanProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
  }

  export type UserCreateWithoutHierarchicalInspectionChecklistsInput = {
    id?: string
    username?: string | null
    email: string
    fullName?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutHierarchicalInspectionChecklistsInput = {
    id?: string
    username?: string | null
    email: string
    fullName?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutHierarchicalInspectionChecklistsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutHierarchicalInspectionChecklistsInput, UserUncheckedCreateWithoutHierarchicalInspectionChecklistsInput>
  }

  export type HierarchicalInspectionResponseUpsertWithWhereUniqueWithoutChecklistInput = {
    where: HierarchicalInspectionResponseWhereUniqueInput
    update: XOR<HierarchicalInspectionResponseUpdateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedUpdateWithoutChecklistInput>
    create: XOR<HierarchicalInspectionResponseCreateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedCreateWithoutChecklistInput>
  }

  export type HierarchicalInspectionResponseUpdateWithWhereUniqueWithoutChecklistInput = {
    where: HierarchicalInspectionResponseWhereUniqueInput
    data: XOR<HierarchicalInspectionResponseUpdateWithoutChecklistInput, HierarchicalInspectionResponseUncheckedUpdateWithoutChecklistInput>
  }

  export type HierarchicalInspectionResponseUpdateManyWithWhereWithoutChecklistInput = {
    where: HierarchicalInspectionResponseScalarWhereInput
    data: XOR<HierarchicalInspectionResponseUpdateManyMutationInput, HierarchicalInspectionResponseUncheckedUpdateManyWithoutChecklistInput>
  }

  export type HierarchicalInspectionResponseScalarWhereInput = {
    AND?: HierarchicalInspectionResponseScalarWhereInput | HierarchicalInspectionResponseScalarWhereInput[]
    OR?: HierarchicalInspectionResponseScalarWhereInput[]
    NOT?: HierarchicalInspectionResponseScalarWhereInput | HierarchicalInspectionResponseScalarWhereInput[]
    id?: StringFilter<"HierarchicalInspectionResponse"> | string
    checklistId?: StringFilter<"HierarchicalInspectionResponse"> | string
    categoryId?: StringFilter<"HierarchicalInspectionResponse"> | string
    itemId?: StringFilter<"HierarchicalInspectionResponse"> | string
    booleanValue?: BoolNullableFilter<"HierarchicalInspectionResponse"> | boolean | null
    textValue?: StringNullableFilter<"HierarchicalInspectionResponse"> | string | null
    createdAt?: DateTimeFilter<"HierarchicalInspectionResponse"> | Date | string
  }

  export type ProductUpsertWithoutHierarchicalInspectionChecklistInput = {
    update: XOR<ProductUpdateWithoutHierarchicalInspectionChecklistInput, ProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput>
    create: XOR<ProductCreateWithoutHierarchicalInspectionChecklistInput, ProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutHierarchicalInspectionChecklistInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutHierarchicalInspectionChecklistInput, ProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput>
  }

  export type ProductUpdateWithoutHierarchicalInspectionChecklistInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryPlanProductUpsertWithoutHierarchicalInspectionChecklistInput = {
    update: XOR<DeliveryPlanProductUpdateWithoutHierarchicalInspectionChecklistInput, DeliveryPlanProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput>
    create: XOR<DeliveryPlanProductCreateWithoutHierarchicalInspectionChecklistInput, DeliveryPlanProductUncheckedCreateWithoutHierarchicalInspectionChecklistInput>
    where?: DeliveryPlanProductWhereInput
  }

  export type DeliveryPlanProductUpdateToOneWithWhereWithoutHierarchicalInspectionChecklistInput = {
    where?: DeliveryPlanProductWhereInput
    data: XOR<DeliveryPlanProductUpdateWithoutHierarchicalInspectionChecklistInput, DeliveryPlanProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput>
  }

  export type DeliveryPlanProductUpdateWithoutHierarchicalInspectionChecklistInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryPlanProductUncheckedUpdateWithoutHierarchicalInspectionChecklistInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutHierarchicalInspectionChecklistsInput = {
    update: XOR<UserUpdateWithoutHierarchicalInspectionChecklistsInput, UserUncheckedUpdateWithoutHierarchicalInspectionChecklistsInput>
    create: XOR<UserCreateWithoutHierarchicalInspectionChecklistsInput, UserUncheckedCreateWithoutHierarchicalInspectionChecklistsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutHierarchicalInspectionChecklistsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutHierarchicalInspectionChecklistsInput, UserUncheckedUpdateWithoutHierarchicalInspectionChecklistsInput>
  }

  export type UserUpdateWithoutHierarchicalInspectionChecklistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutHierarchicalInspectionChecklistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HierarchicalInspectionChecklistCreateWithoutResponsesInput = {
    id?: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
    product?: ProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
    deliveryPlanProduct?: DeliveryPlanProductCreateNestedOneWithoutHierarchicalInspectionChecklistInput
    createdByUser: UserCreateNestedOneWithoutHierarchicalInspectionChecklistsInput
  }

  export type HierarchicalInspectionChecklistUncheckedCreateWithoutResponsesInput = {
    id?: string
    productId?: string | null
    deliveryPlanProductId?: string | null
    createdBy: string
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
  }

  export type HierarchicalInspectionChecklistCreateOrConnectWithoutResponsesInput = {
    where: HierarchicalInspectionChecklistWhereUniqueInput
    create: XOR<HierarchicalInspectionChecklistCreateWithoutResponsesInput, HierarchicalInspectionChecklistUncheckedCreateWithoutResponsesInput>
  }

  export type HierarchicalInspectionChecklistUpsertWithoutResponsesInput = {
    update: XOR<HierarchicalInspectionChecklistUpdateWithoutResponsesInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutResponsesInput>
    create: XOR<HierarchicalInspectionChecklistCreateWithoutResponsesInput, HierarchicalInspectionChecklistUncheckedCreateWithoutResponsesInput>
    where?: HierarchicalInspectionChecklistWhereInput
  }

  export type HierarchicalInspectionChecklistUpdateToOneWithWhereWithoutResponsesInput = {
    where?: HierarchicalInspectionChecklistWhereInput
    data: XOR<HierarchicalInspectionChecklistUpdateWithoutResponsesInput, HierarchicalInspectionChecklistUncheckedUpdateWithoutResponsesInput>
  }

  export type HierarchicalInspectionChecklistUpdateWithoutResponsesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    product?: ProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
    deliveryPlanProduct?: DeliveryPlanProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
    createdByUser?: UserUpdateOneRequiredWithoutHierarchicalInspectionChecklistsNestedInput
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateWithoutResponsesInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPlanProductId?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HierarchicalInspectionChecklistCreateManyCreatedByUserInput = {
    id?: string
    productId?: string | null
    deliveryPlanProductId?: string | null
    createdAt?: Date | string
    verifiedBy?: string | null
    verifiedAt?: Date | string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    notes?: string | null
  }

  export type HierarchicalInspectionChecklistUpdateWithoutCreatedByUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUpdateManyWithoutChecklistNestedInput
    product?: ProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
    deliveryPlanProduct?: DeliveryPlanProductUpdateOneWithoutHierarchicalInspectionChecklistNestedInput
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateWithoutCreatedByUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPlanProductId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    responses?: HierarchicalInspectionResponseUncheckedUpdateManyWithoutChecklistNestedInput
  }

  export type HierarchicalInspectionChecklistUncheckedUpdateManyWithoutCreatedByUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPlanProductId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedBy?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HierarchicalInspectionResponseCreateManyChecklistInput = {
    id?: string
    categoryId: string
    itemId: string
    booleanValue?: boolean | null
    textValue?: string | null
    createdAt?: Date | string
  }

  export type HierarchicalInspectionResponseUpdateWithoutChecklistInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    booleanValue?: NullableBoolFieldUpdateOperationsInput | boolean | null
    textValue?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HierarchicalInspectionResponseUncheckedUpdateWithoutChecklistInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    booleanValue?: NullableBoolFieldUpdateOperationsInput | boolean | null
    textValue?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HierarchicalInspectionResponseUncheckedUpdateManyWithoutChecklistInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    booleanValue?: NullableBoolFieldUpdateOperationsInput | boolean | null
    textValue?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use HierarchicalInspectionChecklistCountOutputTypeDefaultArgs instead
     */
    export type HierarchicalInspectionChecklistCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = HierarchicalInspectionChecklistCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductDefaultArgs instead
     */
    export type ProductArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DeliveryPlanProductDefaultArgs instead
     */
    export type DeliveryPlanProductArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DeliveryPlanProductDefaultArgs<ExtArgs>
    /**
     * @deprecated Use HierarchicalInspectionChecklistDefaultArgs instead
     */
    export type HierarchicalInspectionChecklistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = HierarchicalInspectionChecklistDefaultArgs<ExtArgs>
    /**
     * @deprecated Use HierarchicalInspectionResponseDefaultArgs instead
     */
    export type HierarchicalInspectionResponseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = HierarchicalInspectionResponseDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}