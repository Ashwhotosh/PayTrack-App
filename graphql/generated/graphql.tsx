// graphql/generated/graphql.tsx
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
};

export type AddBankAccountInput = {
  accountHolderName: Scalars['String']['input'];
  accountNumberLast4: Scalars['String']['input'];
  bankName: Scalars['String']['input'];
};

export type AddCardAccountInput = {
  cardHolderName: Scalars['String']['input'];
  cardLast4Digits: Scalars['String']['input'];
  cardType: Scalars['String']['input'];
};

export type AddUpiAccountInput = {
  displayName: Scalars['String']['input'];
  upiId: Scalars['String']['input'];
};

/** Represents the combined output of a spending forecast and an AI-generated expenditure tip. */
export type AnalyticsInsight = {
  __typename?: 'AnalyticsInsight';
  categoryContext?: Maybe<Scalars['String']['output']>;
  expenditureTip?: Maybe<Scalars['String']['output']>;
  forecastedSpending: Array<Scalars['Float']['output']>;
  periodsCovered?: Maybe<Scalars['Int']['output']>;
};

/** Payload returned after successful authentication (e.g., login, signup). */
export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

/** Details specific to a transaction made via Card. */
export type CardTransaction = {
  __typename?: 'CardTransaction';
  id: Scalars['ID']['output'];
  payeeMerchantName: Scalars['String']['output'];
  payerCardAccount: UserCardAccount;
  payerCardAccountId: Scalars['ID']['output'];
};

/** Input fields specific to creating Card transaction details. */
export type CardTransactionInput = {
  payeeMerchantName: Scalars['String']['input'];
};

/** Represents a summary of spending for a specific category. */
export type CategorySpending = {
  __typename?: 'CategorySpending';
  category: Scalars['String']['output'];
  totalAmount: Scalars['Decimal']['output'];
};

/** Represents a category suggestion from the AI/ML service. */
export type CategorySuggestion = {
  __typename?: 'CategorySuggestion';
  category: Scalars['String']['output'];
  confidence: Scalars['Float']['output'];
};

/** Input required to create a new transaction record. */
export type CreateTransactionInput = {
  /** Amount of the transaction (must be positive). */
  amount: Scalars['Decimal']['input'];
  cardDetails?: InputMaybe<CardTransactionInput>;
  netBankingDetails?: InputMaybe<NetBankingTransactionInput>;
  /** Optional notes about the transaction. */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the User's payment account (UPI, Card, or Bank) initiating the transaction. */
  payerAccountId: Scalars['ID']['input'];
  /** Optional timestamp (ISO 8601 string), defaults to server time if omitted. */
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
  /** Type of the transaction (UPI, CARD, NET_BANKING). */
  transactionType: TransactionType;
  upiDetails?: InputMaybe<UpiTransactionInput>;
};

/** Options for user's gender identity. */
export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE',
  Other = 'OTHER'
}

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Adds a new Bank account for the current user. */
  addBankAccount: UserBankAccount;
  /** Adds a new Card account for the current user. */
  addCardAccount: UserCardAccount;
  /** Adds a new UPI account for the current user. */
  addUpiAccount: UserUpiAccount;
  /**
   * Creates a new transaction record.
   * Triggers background job for categorization.
   */
  createTransaction: Transaction;
  /** Logs in an existing user. */
  login: AuthPayload;
  /** Registers a new user. */
  signup: AuthPayload;
  /**
   * Updates the category of an existing transaction.
   * Ensures the transaction belongs to the current user.
   */
  updateTransactionCategory: Transaction;
  /** Updates details for the currently authenticated user. */
  updateUser: User;
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationAddBankAccountArgs = {
  input: AddBankAccountInput;
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationAddCardAccountArgs = {
  input: AddCardAccountInput;
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationAddUpiAccountArgs = {
  input: AddUpiAccountInput;
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationCreateTransactionArgs = {
  input: CreateTransactionInput;
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationLoginArgs = {
  input: LoginInput;
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationSignupArgs = {
  input: SignupInput;
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationUpdateTransactionCategoryArgs = {
  category: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


/**
 * The root mutation type. All write operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

/** Details specific to a transaction made via NetBanking. */
export type NetBankingTransaction = {
  __typename?: 'NetBankingTransaction';
  id: Scalars['ID']['output'];
  payeeBankName: Scalars['String']['output'];
  payeeName: Scalars['String']['output'];
  payerBankAccount: UserBankAccount;
  payerBankAccountId: Scalars['ID']['output'];
  referenceId: Scalars['String']['output'];
};

/** Input fields specific to creating NetBanking transaction details. */
export type NetBankingTransactionInput = {
  payeeBankName: Scalars['String']['input'];
  payeeName: Scalars['String']['input'];
  referenceId: Scalars['String']['input'];
};

/**
 * The root query type. All read operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Fetches all available transaction categories from the AI/ML service. */
  availableTransactionCategories: Array<Scalars['String']['output']>;
  /** Fetches a summary of spending aggregated by category within a given date range. */
  categorySpendingSummary: Array<CategorySpending>;
  /**
   * Fetches a spending forecast and an AI-generated expenditure tip based on the user's
   * entire transaction history (optionally filtered by category).
   */
  getAnalyticsWithInsight?: Maybe<AnalyticsInsight>;
  /**
   * Fetches a real-time category suggestion for a given transaction ID.
   * Calls the external AI/ML service. Requires the transaction to exist and belong to the user.
   */
  getRealtimeCategorySuggestion?: Maybe<CategorySuggestion>;
  /** Retrieves the currently authenticated user's details. */
  me?: Maybe<User>;
  /** Fetches all bank accounts linked to the current user. */
  myBankAccounts: Array<UserBankAccount>;
  /** Fetches all card accounts linked to the current user. */
  myCardAccounts: Array<UserCardAccount>;
  /** Fetches all UPI accounts linked to the current user. */
  myUpiAccounts: Array<UserUpiAccount>;
  /**
   * Fetches a single transaction by its ID.
   * Ensures the transaction belongs to the current user.
   */
  transaction?: Maybe<Transaction>;
  /**
   * Fetches transactions for the currently authenticated user.
   * Supports filtering by type/date range and pagination.
   */
  transactions: Array<Transaction>;
};


/**
 * The root query type. All read operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type QueryCategorySpendingSummaryArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * The root query type. All read operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type QueryGetAnalyticsWithInsightArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  periodsAhead?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * The root query type. All read operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type QueryGetRealtimeCategorySuggestionArgs = {
  transactionId: Scalars['ID']['input'];
};


/**
 * The root query type. All read operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type QueryTransactionArgs = {
  id: Scalars['ID']['input'];
};


/**
 * The root query type. All read operations start here.
 * Extend this type with additional fields in other schema files.
 */
export type QueryTransactionsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  filterType?: InputMaybe<TransactionType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type SignupInput = {
  dob?: InputMaybe<Scalars['DateTime']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  profession?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a single financial transaction record. */
export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Decimal']['output'];
  cardDetails?: Maybe<CardTransaction>;
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  flow: TransactionFlow;
  id: Scalars['ID']['output'];
  netBankingDetails?: Maybe<NetBankingTransaction>;
  notes?: Maybe<Scalars['String']['output']>;
  payer: User;
  timestamp: Scalars['DateTime']['output'];
  transactionType: TransactionType;
  updatedAt: Scalars['DateTime']['output'];
  upiDetails?: Maybe<UpiTransaction>;
  userId: Scalars['ID']['output'];
};

/** Indicates the direction of money flow relative to the user. */
export enum TransactionFlow {
  Credit = 'CREDIT',
  Debit = 'DEBIT'
}

/** Types of supported financial transactions. */
export enum TransactionType {
  Card = 'CARD',
  NetBanking = 'NET_BANKING',
  Upi = 'UPI'
}

/** Details specific to a transaction made via UPI. */
export type UpiTransaction = {
  __typename?: 'UPITransaction';
  id: Scalars['ID']['output'];
  payeeName: Scalars['String']['output'];
  payeeUpiId: Scalars['String']['output'];
  payerUpiAccount: UserUpiAccount;
  payerUpiAccountId: Scalars['ID']['output'];
};

export type UpdateUserInput = {
  dob?: InputMaybe<Scalars['DateTime']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profession?: InputMaybe<Scalars['String']['input']>;
};

/** Input fields specific to creating UPI transaction details. */
export type UpiTransactionInput = {
  payeeName: Scalars['String']['input'];
  payeeUpiId: Scalars['String']['input'];
};

/** Represents a registered user of the platform. */
export type User = {
  __typename?: 'User';
  /** Fetches bank accounts linked to this user. */
  bankAccounts: Array<UserBankAccount>;
  /** Fetches card accounts linked to this user. */
  cardAccounts: Array<UserCardAccount>;
  createdAt: Scalars['DateTime']['output'];
  dob?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Gender>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profession?: Maybe<Scalars['String']['output']>;
  /** Fetches transactions associated with this user (requires pagination arguments). */
  transactions: Array<Transaction>;
  updatedAt: Scalars['DateTime']['output'];
  /** Fetches UPI accounts linked to this user. */
  upiAccounts: Array<UserUpiAccount>;
};


/** Represents a registered user of the platform. */
export type UserTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

/** Represents a User's linked bank account. */
export type UserBankAccount = {
  __typename?: 'UserBankAccount';
  accountHolderName: Scalars['String']['output'];
  accountNumberLast4: Scalars['String']['output'];
  bankName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

/** Represents a User's linked credit or debit card. */
export type UserCardAccount = {
  __typename?: 'UserCardAccount';
  cardHolderName: Scalars['String']['output'];
  cardLast4Digits: Scalars['String']['output'];
  cardType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

/** Represents a User's linked UPI payment account. */
export type UserUpiAccount = {
  __typename?: 'UserUpiAccount';
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  upiId: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, firstName?: string | null, lastName?: string | null, phone?: string | null, gender?: Gender | null, dob?: any | null, profession?: string | null } } };

export type SignupMutationVariables = Exact<{
  input: SignupInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', signup: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, firstName?: string | null, lastName?: string | null } } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, firstName?: string | null, lastName?: string | null, middleName?: string | null, phone?: string | null, gender?: Gender | null, dob?: any | null, profession?: string | null, createdAt: any, updatedAt: any } | null };

export type GetAvailableCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableCategoriesQuery = { __typename?: 'Query', availableTransactionCategories: Array<string> };

export type UpdateTransactionCategoryMutationVariables = Exact<{
  transactionId: Scalars['ID']['input'];
  category: Scalars['String']['input'];
}>;


export type UpdateTransactionCategoryMutation = { __typename?: 'Mutation', updateTransactionCategory: { __typename?: 'Transaction', id: string, category?: string | null, amount: any, notes?: string | null, timestamp: any, transactionType: TransactionType, flow: TransactionFlow, upiDetails?: { __typename?: 'UPITransaction', id: string } | null, cardDetails?: { __typename?: 'CardTransaction', id: string } | null, netBankingDetails?: { __typename?: 'NetBankingTransaction', id: string } | null } };

export type CreateTransactionMutationVariables = Exact<{
  input: CreateTransactionInput;
}>;


export type CreateTransactionMutation = { __typename?: 'Mutation', createTransaction: { __typename?: 'Transaction', id: string, amount: any, transactionType: TransactionType, flow: TransactionFlow, notes?: string | null, timestamp: any, upiDetails?: { __typename?: 'UPITransaction', id: string, payeeUpiId: string, payeeName: string } | null, cardDetails?: { __typename?: 'CardTransaction', id: string, payeeMerchantName: string } | null, netBankingDetails?: { __typename?: 'NetBankingTransaction', id: string, payeeName: string, payeeBankName: string, referenceId: string } | null } };

export type GetRealtimeCategorySuggestionQueryVariables = Exact<{
  transactionId: Scalars['ID']['input'];
}>;


export type GetRealtimeCategorySuggestionQuery = { __typename?: 'Query', getRealtimeCategorySuggestion?: { __typename?: 'CategorySuggestion', category: string, confidence: number } | null };

export type GetMyUpiAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyUpiAccountsQuery = { __typename?: 'Query', myUpiAccounts: Array<{ __typename?: 'UserUpiAccount', id: string, upiId: string, displayName: string }> };

export type GetAnalyticsTransactionsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type GetAnalyticsTransactionsQuery = { __typename?: 'Query', transactions: Array<{ __typename?: 'Transaction', id: string, amount: any, transactionType: TransactionType, flow: TransactionFlow, timestamp: any, category?: string | null, notes?: string | null, upiDetails?: { __typename?: 'UPITransaction', id: string, payeeName: string, payeeUpiId: string } | null, cardDetails?: { __typename?: 'CardTransaction', id: string, payeeMerchantName: string } | null, netBankingDetails?: { __typename?: 'NetBankingTransaction', id: string, payeeName: string } | null }> };

export type GetDashboardTransactionsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type GetDashboardTransactionsQuery = { __typename?: 'Query', transactions: Array<{ __typename?: 'Transaction', id: string, amount: any, transactionType: TransactionType, flow: TransactionFlow, timestamp: any, category?: string | null, notes?: string | null, upiDetails?: { __typename?: 'UPITransaction', id: string, payeeName: string } | null, cardDetails?: { __typename?: 'CardTransaction', id: string, payeeMerchantName: string } | null, netBankingDetails?: { __typename?: 'NetBankingTransaction', id: string, payeeName: string } | null }> };

export type GetCategorySpendingSummaryQueryVariables = Exact<{
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type GetCategorySpendingSummaryQuery = { __typename?: 'Query', categorySpendingSummary: Array<{ __typename?: 'CategorySpending', category: string, totalAmount: any }> };

export type GetAnalyticsWithInsightQueryVariables = Exact<{
  periodsAhead?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAnalyticsWithInsightQuery = { __typename?: 'Query', getAnalyticsWithInsight?: { __typename?: 'AnalyticsInsight', forecastedSpending: Array<number>, expenditureTip?: string | null, categoryContext?: string | null, periodsCovered?: number | null } | null };

export type GetTransactionDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTransactionDetailsQuery = { __typename?: 'Query', transaction?: { __typename?: 'Transaction', id: string, amount: any, transactionType: TransactionType, flow: TransactionFlow, timestamp: any, notes?: string | null, category?: string | null, createdAt: any, upiDetails?: { __typename?: 'UPITransaction', id: string, payeeName: string, payeeUpiId: string, payerUpiAccount: { __typename?: 'UserUpiAccount', id: string, displayName: string, upiId: string } } | null, cardDetails?: { __typename?: 'CardTransaction', id: string, payeeMerchantName: string, payerCardAccount: { __typename?: 'UserCardAccount', id: string, cardLast4Digits: string, cardType: string } } | null, netBankingDetails?: { __typename?: 'NetBankingTransaction', id: string, payeeName: string, payeeBankName: string, referenceId: string, payerBankAccount: { __typename?: 'UserBankAccount', id: string, bankName: string, accountNumberLast4: string } } | null } | null };


export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
      phone
      gender
      dob
      profession
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const SignupDocument = gql`
    mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
    }
  }
}
    `;
export type SignupMutationFn = Apollo.MutationFunction<SignupMutation, SignupMutationVariables>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = Apollo.MutationResult<SignupMutation>;
export type SignupMutationOptions = Apollo.BaseMutationOptions<SignupMutation, SignupMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    firstName
    lastName
    middleName
    phone
    gender
    dob
    profession
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const GetAvailableCategoriesDocument = gql`
    query GetAvailableCategories {
  availableTransactionCategories
}
    `;

/**
 * __useGetAvailableCategoriesQuery__
 *
 * To run a query within a React component, call `useGetAvailableCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableCategoriesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAvailableCategoriesQuery, GetAvailableCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAvailableCategoriesQuery, GetAvailableCategoriesQueryVariables>(GetAvailableCategoriesDocument, options);
      }
export function useGetAvailableCategoriesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAvailableCategoriesQuery, GetAvailableCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAvailableCategoriesQuery, GetAvailableCategoriesQueryVariables>(GetAvailableCategoriesDocument, options);
        }
export function useGetAvailableCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAvailableCategoriesQuery, GetAvailableCategoriesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAvailableCategoriesQuery, GetAvailableCategoriesQueryVariables>(GetAvailableCategoriesDocument, options);
        }
export type GetAvailableCategoriesQueryHookResult = ReturnType<typeof useGetAvailableCategoriesQuery>;
export type GetAvailableCategoriesLazyQueryHookResult = ReturnType<typeof useGetAvailableCategoriesLazyQuery>;
export type GetAvailableCategoriesSuspenseQueryHookResult = ReturnType<typeof useGetAvailableCategoriesSuspenseQuery>;
export type GetAvailableCategoriesQueryResult = Apollo.QueryResult<GetAvailableCategoriesQuery, GetAvailableCategoriesQueryVariables>;
export const UpdateTransactionCategoryDocument = gql`
    mutation UpdateTransactionCategory($transactionId: ID!, $category: String!) {
  updateTransactionCategory(id: $transactionId, category: $category) {
    id
    category
    amount
    notes
    timestamp
    transactionType
    flow
    upiDetails {
      id
    }
    cardDetails {
      id
    }
    netBankingDetails {
      id
    }
  }
}
    `;
export type UpdateTransactionCategoryMutationFn = Apollo.MutationFunction<UpdateTransactionCategoryMutation, UpdateTransactionCategoryMutationVariables>;

/**
 * __useUpdateTransactionCategoryMutation__
 *
 * To run a mutation, you first call `useUpdateTransactionCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTransactionCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTransactionCategoryMutation, { data, loading, error }] = useUpdateTransactionCategoryMutation({
 *   variables: {
 *      transactionId: // value for 'transactionId'
 *      category: // value for 'category'
 *   },
 * });
 */
export function useUpdateTransactionCategoryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateTransactionCategoryMutation, UpdateTransactionCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateTransactionCategoryMutation, UpdateTransactionCategoryMutationVariables>(UpdateTransactionCategoryDocument, options);
      }
export type UpdateTransactionCategoryMutationHookResult = ReturnType<typeof useUpdateTransactionCategoryMutation>;
export type UpdateTransactionCategoryMutationResult = Apollo.MutationResult<UpdateTransactionCategoryMutation>;
export type UpdateTransactionCategoryMutationOptions = Apollo.BaseMutationOptions<UpdateTransactionCategoryMutation, UpdateTransactionCategoryMutationVariables>;
export const CreateTransactionDocument = gql`
    mutation CreateTransaction($input: CreateTransactionInput!) {
  createTransaction(input: $input) {
    id
    amount
    transactionType
    flow
    notes
    timestamp
    upiDetails {
      id
      payeeUpiId
      payeeName
    }
    cardDetails {
      id
      payeeMerchantName
    }
    netBankingDetails {
      id
      payeeName
      payeeBankName
      referenceId
    }
  }
}
    `;
export type CreateTransactionMutationFn = Apollo.MutationFunction<CreateTransactionMutation, CreateTransactionMutationVariables>;

/**
 * __useCreateTransactionMutation__
 *
 * To run a mutation, you first call `useCreateTransactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTransactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTransactionMutation, { data, loading, error }] = useCreateTransactionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTransactionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateTransactionMutation, CreateTransactionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateTransactionMutation, CreateTransactionMutationVariables>(CreateTransactionDocument, options);
      }
export type CreateTransactionMutationHookResult = ReturnType<typeof useCreateTransactionMutation>;
export type CreateTransactionMutationResult = Apollo.MutationResult<CreateTransactionMutation>;
export type CreateTransactionMutationOptions = Apollo.BaseMutationOptions<CreateTransactionMutation, CreateTransactionMutationVariables>;
export const GetRealtimeCategorySuggestionDocument = gql`
    query GetRealtimeCategorySuggestion($transactionId: ID!) {
  getRealtimeCategorySuggestion(transactionId: $transactionId) {
    category
    confidence
  }
}
    `;

/**
 * __useGetRealtimeCategorySuggestionQuery__
 *
 * To run a query within a React component, call `useGetRealtimeCategorySuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRealtimeCategorySuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRealtimeCategorySuggestionQuery({
 *   variables: {
 *      transactionId: // value for 'transactionId'
 *   },
 * });
 */
export function useGetRealtimeCategorySuggestionQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetRealtimeCategorySuggestionQuery, GetRealtimeCategorySuggestionQueryVariables> & ({ variables: GetRealtimeCategorySuggestionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetRealtimeCategorySuggestionQuery, GetRealtimeCategorySuggestionQueryVariables>(GetRealtimeCategorySuggestionDocument, options);
      }
export function useGetRealtimeCategorySuggestionLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetRealtimeCategorySuggestionQuery, GetRealtimeCategorySuggestionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetRealtimeCategorySuggestionQuery, GetRealtimeCategorySuggestionQueryVariables>(GetRealtimeCategorySuggestionDocument, options);
        }
export function useGetRealtimeCategorySuggestionSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetRealtimeCategorySuggestionQuery, GetRealtimeCategorySuggestionQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetRealtimeCategorySuggestionQuery, GetRealtimeCategorySuggestionQueryVariables>(GetRealtimeCategorySuggestionDocument, options);
        }
export type GetRealtimeCategorySuggestionQueryHookResult = ReturnType<typeof useGetRealtimeCategorySuggestionQuery>;
export type GetRealtimeCategorySuggestionLazyQueryHookResult = ReturnType<typeof useGetRealtimeCategorySuggestionLazyQuery>;
export type GetRealtimeCategorySuggestionSuspenseQueryHookResult = ReturnType<typeof useGetRealtimeCategorySuggestionSuspenseQuery>;
export type GetRealtimeCategorySuggestionQueryResult = Apollo.QueryResult<GetRealtimeCategorySuggestionQuery, GetRealtimeCategorySuggestionQueryVariables>;
export const GetMyUpiAccountsDocument = gql`
    query GetMyUpiAccounts {
  myUpiAccounts {
    id
    upiId
    displayName
  }
}
    `;

/**
 * __useGetMyUpiAccountsQuery__
 *
 * To run a query within a React component, call `useGetMyUpiAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyUpiAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyUpiAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMyUpiAccountsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetMyUpiAccountsQuery, GetMyUpiAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMyUpiAccountsQuery, GetMyUpiAccountsQueryVariables>(GetMyUpiAccountsDocument, options);
      }
export function useGetMyUpiAccountsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMyUpiAccountsQuery, GetMyUpiAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMyUpiAccountsQuery, GetMyUpiAccountsQueryVariables>(GetMyUpiAccountsDocument, options);
        }
export function useGetMyUpiAccountsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetMyUpiAccountsQuery, GetMyUpiAccountsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetMyUpiAccountsQuery, GetMyUpiAccountsQueryVariables>(GetMyUpiAccountsDocument, options);
        }
export type GetMyUpiAccountsQueryHookResult = ReturnType<typeof useGetMyUpiAccountsQuery>;
export type GetMyUpiAccountsLazyQueryHookResult = ReturnType<typeof useGetMyUpiAccountsLazyQuery>;
export type GetMyUpiAccountsSuspenseQueryHookResult = ReturnType<typeof useGetMyUpiAccountsSuspenseQuery>;
export type GetMyUpiAccountsQueryResult = Apollo.QueryResult<GetMyUpiAccountsQuery, GetMyUpiAccountsQueryVariables>;
export const GetAnalyticsTransactionsDocument = gql`
    query GetAnalyticsTransactions($limit: Int, $offset: Int, $dateFrom: DateTime, $dateTo: DateTime) {
  transactions(
    limit: $limit
    offset: $offset
    dateFrom: $dateFrom
    dateTo: $dateTo
  ) {
    id
    amount
    transactionType
    flow
    timestamp
    category
    notes
    upiDetails {
      id
      payeeName
      payeeUpiId
    }
    cardDetails {
      id
      payeeMerchantName
    }
    netBankingDetails {
      id
      payeeName
    }
  }
}
    `;

/**
 * __useGetAnalyticsTransactionsQuery__
 *
 * To run a query within a React component, call `useGetAnalyticsTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnalyticsTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnalyticsTransactionsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      dateFrom: // value for 'dateFrom'
 *      dateTo: // value for 'dateTo'
 *   },
 * });
 */
export function useGetAnalyticsTransactionsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>(GetAnalyticsTransactionsDocument, options);
      }
export function useGetAnalyticsTransactionsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>(GetAnalyticsTransactionsDocument, options);
        }
export function useGetAnalyticsTransactionsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>(GetAnalyticsTransactionsDocument, options);
        }
export type GetAnalyticsTransactionsQueryHookResult = ReturnType<typeof useGetAnalyticsTransactionsQuery>;
export type GetAnalyticsTransactionsLazyQueryHookResult = ReturnType<typeof useGetAnalyticsTransactionsLazyQuery>;
export type GetAnalyticsTransactionsSuspenseQueryHookResult = ReturnType<typeof useGetAnalyticsTransactionsSuspenseQuery>;
export type GetAnalyticsTransactionsQueryResult = Apollo.QueryResult<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>;
export const GetDashboardTransactionsDocument = gql`
    query GetDashboardTransactions($limit: Int, $offset: Int, $dateFrom: DateTime, $dateTo: DateTime) {
  transactions(
    limit: $limit
    offset: $offset
    dateFrom: $dateFrom
    dateTo: $dateTo
  ) {
    id
    amount
    transactionType
    flow
    timestamp
    category
    notes
    upiDetails {
      id
      payeeName
    }
    cardDetails {
      id
      payeeMerchantName
    }
    netBankingDetails {
      id
      payeeName
    }
  }
}
    `;

/**
 * __useGetDashboardTransactionsQuery__
 *
 * To run a query within a React component, call `useGetDashboardTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDashboardTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDashboardTransactionsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      dateFrom: // value for 'dateFrom'
 *      dateTo: // value for 'dateTo'
 *   },
 * });
 */
export function useGetDashboardTransactionsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetDashboardTransactionsQuery, GetDashboardTransactionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetDashboardTransactionsQuery, GetDashboardTransactionsQueryVariables>(GetDashboardTransactionsDocument, options);
      }
export function useGetDashboardTransactionsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetDashboardTransactionsQuery, GetDashboardTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetDashboardTransactionsQuery, GetDashboardTransactionsQueryVariables>(GetDashboardTransactionsDocument, options);
        }
export function useGetDashboardTransactionsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetDashboardTransactionsQuery, GetDashboardTransactionsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetDashboardTransactionsQuery, GetDashboardTransactionsQueryVariables>(GetDashboardTransactionsDocument, options);
        }
export type GetDashboardTransactionsQueryHookResult = ReturnType<typeof useGetDashboardTransactionsQuery>;
export type GetDashboardTransactionsLazyQueryHookResult = ReturnType<typeof useGetDashboardTransactionsLazyQuery>;
export type GetDashboardTransactionsSuspenseQueryHookResult = ReturnType<typeof useGetDashboardTransactionsSuspenseQuery>;
export type GetDashboardTransactionsQueryResult = Apollo.QueryResult<GetDashboardTransactionsQuery, GetDashboardTransactionsQueryVariables>;
export const GetCategorySpendingSummaryDocument = gql`
    query GetCategorySpendingSummary($dateFrom: DateTime, $dateTo: DateTime) {
  categorySpendingSummary(dateFrom: $dateFrom, dateTo: $dateTo) {
    category
    totalAmount
  }
}
    `;

/**
 * __useGetCategorySpendingSummaryQuery__
 *
 * To run a query within a React component, call `useGetCategorySpendingSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategorySpendingSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategorySpendingSummaryQuery({
 *   variables: {
 *      dateFrom: // value for 'dateFrom'
 *      dateTo: // value for 'dateTo'
 *   },
 * });
 */
export function useGetCategorySpendingSummaryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetCategorySpendingSummaryQuery, GetCategorySpendingSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCategorySpendingSummaryQuery, GetCategorySpendingSummaryQueryVariables>(GetCategorySpendingSummaryDocument, options);
      }
export function useGetCategorySpendingSummaryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCategorySpendingSummaryQuery, GetCategorySpendingSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCategorySpendingSummaryQuery, GetCategorySpendingSummaryQueryVariables>(GetCategorySpendingSummaryDocument, options);
        }
export function useGetCategorySpendingSummarySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCategorySpendingSummaryQuery, GetCategorySpendingSummaryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetCategorySpendingSummaryQuery, GetCategorySpendingSummaryQueryVariables>(GetCategorySpendingSummaryDocument, options);
        }
export type GetCategorySpendingSummaryQueryHookResult = ReturnType<typeof useGetCategorySpendingSummaryQuery>;
export type GetCategorySpendingSummaryLazyQueryHookResult = ReturnType<typeof useGetCategorySpendingSummaryLazyQuery>;
export type GetCategorySpendingSummarySuspenseQueryHookResult = ReturnType<typeof useGetCategorySpendingSummarySuspenseQuery>;
export type GetCategorySpendingSummaryQueryResult = Apollo.QueryResult<GetCategorySpendingSummaryQuery, GetCategorySpendingSummaryQueryVariables>;
export const GetAnalyticsWithInsightDocument = gql`
    query GetAnalyticsWithInsight($periodsAhead: Int, $category: String) {
  getAnalyticsWithInsight(periodsAhead: $periodsAhead, category: $category) {
    forecastedSpending
    expenditureTip
    categoryContext
    periodsCovered
  }
}
    `;

/**
 * __useGetAnalyticsWithInsightQuery__
 *
 * To run a query within a React component, call `useGetAnalyticsWithInsightQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnalyticsWithInsightQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnalyticsWithInsightQuery({
 *   variables: {
 *      periodsAhead: // value for 'periodsAhead'
 *      category: // value for 'category'
 *   },
 * });
 */
export function useGetAnalyticsWithInsightQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAnalyticsWithInsightQuery, GetAnalyticsWithInsightQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAnalyticsWithInsightQuery, GetAnalyticsWithInsightQueryVariables>(GetAnalyticsWithInsightDocument, options);
      }
export function useGetAnalyticsWithInsightLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAnalyticsWithInsightQuery, GetAnalyticsWithInsightQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAnalyticsWithInsightQuery, GetAnalyticsWithInsightQueryVariables>(GetAnalyticsWithInsightDocument, options);
        }
export function useGetAnalyticsWithInsightSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAnalyticsWithInsightQuery, GetAnalyticsWithInsightQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAnalyticsWithInsightQuery, GetAnalyticsWithInsightQueryVariables>(GetAnalyticsWithInsightDocument, options);
        }
export type GetAnalyticsWithInsightQueryHookResult = ReturnType<typeof useGetAnalyticsWithInsightQuery>;
export type GetAnalyticsWithInsightLazyQueryHookResult = ReturnType<typeof useGetAnalyticsWithInsightLazyQuery>;
export type GetAnalyticsWithInsightSuspenseQueryHookResult = ReturnType<typeof useGetAnalyticsWithInsightSuspenseQuery>;
export type GetAnalyticsWithInsightQueryResult = Apollo.QueryResult<GetAnalyticsWithInsightQuery, GetAnalyticsWithInsightQueryVariables>;
export const GetTransactionDetailsDocument = gql`
    query GetTransactionDetails($id: ID!) {
  transaction(id: $id) {
    id
    amount
    transactionType
    flow
    timestamp
    notes
    category
    createdAt
    upiDetails {
      id
      payeeName
      payeeUpiId
      payerUpiAccount {
        id
        displayName
        upiId
      }
    }
    cardDetails {
      id
      payeeMerchantName
      payerCardAccount {
        id
        cardLast4Digits
        cardType
      }
    }
    netBankingDetails {
      id
      payeeName
      payeeBankName
      referenceId
      payerBankAccount {
        id
        bankName
        accountNumberLast4
      }
    }
  }
}
    `;

/**
 * __useGetTransactionDetailsQuery__
 *
 * To run a query within a React component, call `useGetTransactionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTransactionDetailsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetTransactionDetailsQuery, GetTransactionDetailsQueryVariables> & ({ variables: GetTransactionDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetTransactionDetailsQuery, GetTransactionDetailsQueryVariables>(GetTransactionDetailsDocument, options);
      }
export function useGetTransactionDetailsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetTransactionDetailsQuery, GetTransactionDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetTransactionDetailsQuery, GetTransactionDetailsQueryVariables>(GetTransactionDetailsDocument, options);
        }
export function useGetTransactionDetailsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetTransactionDetailsQuery, GetTransactionDetailsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetTransactionDetailsQuery, GetTransactionDetailsQueryVariables>(GetTransactionDetailsDocument, options);
        }
export type GetTransactionDetailsQueryHookResult = ReturnType<typeof useGetTransactionDetailsQuery>;
export type GetTransactionDetailsLazyQueryHookResult = ReturnType<typeof useGetTransactionDetailsLazyQuery>;
export type GetTransactionDetailsSuspenseQueryHookResult = ReturnType<typeof useGetTransactionDetailsSuspenseQuery>;
export type GetTransactionDetailsQueryResult = Apollo.QueryResult<GetTransactionDetailsQuery, GetTransactionDetailsQueryVariables>;