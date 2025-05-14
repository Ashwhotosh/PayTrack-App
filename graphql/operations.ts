// src/graphql/operations.ts
import { gql } from '@apollo/client';

// === AUTHENTICATION ===
export const LOGIN_MUTATION = gql`
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

export const SIGNUP_MUTATION = gql`
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

export const ME_QUERY = gql`
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

// === TRANSACTIONS & CATEGORIES ===
export const GET_AVAILABLE_CATEGORIES_QUERY = gql`
  query GetAvailableCategories {
    availableTransactionCategories
  }
`;

export const UPDATE_TRANSACTION_CATEGORY_MUTATION = gql`
  mutation UpdateTransactionCategory($transactionId: ID!, $category: String!) {
    updateTransactionCategory(id: $transactionId, category: $category) {
      id
      category
      amount
      notes
      timestamp
      transactionType # Payment method
      flow # <<< ADDED (CREDIT/DEBIT flow)
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

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      amount
      transactionType # Payment method
      flow # <<< ADDED (CREDIT/DEBIT flow)
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

export const GET_REALTIME_CATEGORY_SUGGESTION_QUERY = gql`
  query GetRealtimeCategorySuggestion($transactionId: ID!) {
    getRealtimeCategorySuggestion(transactionId: $transactionId) {
      category
      confidence
    }
  }
`;

// === ACCOUNTS ===
export const GET_MY_UPI_ACCOUNTS_QUERY = gql`
  query GetMyUpiAccounts {
    myUpiAccounts {
      id
      upiId
      displayName
    }
  }
`;
// You would add similar queries for GET_MY_CARD_ACCOUNTS_QUERY and GET_MY_BANK_ACCOUNTS_QUERY if needed


// === ANALYTICS QUERIES ===

export const GET_ANALYTICS_TRANSACTIONS_QUERY = gql`
  query GetAnalyticsTransactions(
    $limit: Int
    $offset: Int
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    transactions(limit: $limit, offset: $offset, dateFrom: $dateFrom, dateTo: $dateTo) {
      id
      amount
      transactionType
      flow # <<< ADDED (CREDIT/DEBIT flow)
      timestamp
      category
      notes
      upiDetails {
        id # <<< ADDED
        payeeName
        payeeUpiId # If needed for display
      }
      cardDetails {
        id # <<< ADDED
        payeeMerchantName
      }
      netBankingDetails {
        id # <<< ADDED
        payeeName
        # payeeBankName
        # referenceId
      }
    }
  }
`;

// This is your main transactions query, used also on the dashboard
export const GET_DASHBOARD_TRANSACTIONS_QUERY = gql`
  query GetDashboardTransactions( # Renamed for clarity, or keep as GetAnalyticsTransactions if preferred
    $limit: Int
    $offset: Int
    $dateFrom: DateTime
    $dateTo: DateTime
    # $filterType: TransactionType # If you had specific filter for payment method
  ) {
    transactions(
      limit: $limit,
      offset: $offset,
      dateFrom: $dateFrom,
      dateTo: $dateTo
      # filterType: $filterType
    ) {
      id
      amount
      transactionType # Payment method
      flow # <<< ADDED (CREDIT/DEBIT flow)
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
      # If you derive merchantName on backend, include it:
      # merchantName
    }
  }
`;

export const GET_CATEGORY_SPENDING_SUMMARY_QUERY = gql`
  query GetCategorySpendingSummary(
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    categorySpendingSummary(dateFrom: $dateFrom, dateTo: $dateTo) {
      category
      totalAmount
    }
  }
`;
// === END ANALYTICS QUERIES ===

// === QUERY FOR TRANSACTION DETAILS ===
export const GET_TRANSACTION_DETAILS_QUERY = gql`
  query GetTransactionDetails($id: ID!) {
    transaction(id: $id) {
      id
      amount # Decimal
      transactionType # Payment method
      flow # <<< ADDED (CREDIT/DEBIT flow)
      timestamp # DateTime
      notes
      category
      createdAt # DateTime
      # payer { # Uncomment if you want to show payer details
      #   id
      #   firstName
      #   lastName
      # }
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
// === END TRANSACTION DETAILS QUERY ===

// Add other queries/mutations as needed