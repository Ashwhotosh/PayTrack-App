// src/types/index.ts

// This should align with your GraphQL User type (non-sensitive fields)
// and what your `me` query and `login/signup` mutations return for the user object.
export interface User {
  id: string;
  email: string;
  passwordHash?: string; // Will be omitted in AuthUser
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null; // Match Prisma/GraphQL enum
  dob?: string | null; // ISO Date string
  profession?: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string

  // Relationships - not typically needed in AuthUser context directly
  transactions?: any[];
  upiAccounts?: any[];
  cardAccounts?: any[];
  bankAccounts?: any[];
}