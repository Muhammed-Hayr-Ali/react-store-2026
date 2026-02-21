
// ==============================================================================
// File Name: generate-discount-code.ts
// Description: Utility function to generate random discount codes.
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// =============================================================================


// ==============================================================================
// Generate Random Discount Code
// =============================================================================
export function generateRandomCode(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
