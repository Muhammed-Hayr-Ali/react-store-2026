import type { Database } from "./database.types"

export type { Database, Json } from "./database.types"

type PublicTables = Database["public"]["Tables"]
type PublicEnums = Database["public"]["Enums"]
type PublicFunctions = Database["public"]["Functions"]

export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"]
export type TablesInsert<T extends keyof PublicTables> =
  PublicTables[T]["Insert"]
export type TablesUpdate<T extends keyof PublicTables> =
  PublicTables[T]["Update"]
export type Enums<T extends keyof PublicEnums> = PublicEnums[T]
export type DbFunctionArgs<Fn extends keyof PublicFunctions> =
  PublicFunctions[Fn]["Args"]
export type DbFunctionReturns<Fn extends keyof PublicFunctions> =
  PublicFunctions[Fn]["Returns"]
