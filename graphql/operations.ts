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
    }
  }
`;

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      amount
      transactionType
      notes
      timestamp
      upiDetails { # Added as per previous recommendation
        payeeUpiId
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


// === ANALYTICS QUERIES (NEW) ===
export const GET_ANALYTICS_TRANSACTIONS_QUERY = gql`
  query GetAnalyticsTransactions(
    $limit: Int
    $offset: Int
    $dateFrom: DateTime
    $dateTo: DateTime # Add other filters specific to analytics if needed
  ) {
    transactions(limit: $limit, offset: $offset, dateFrom: $dateFrom, dateTo: $dateTo) {
      id
      amount # This is Decimal, will be string or number based on scalar mapping
      transactionType
      timestamp
      category
      notes # Can be used for merchant/description if no dedicated field
      # To get merchant name, we need to look into details
      upiDetails {
        payeeName
      }
      cardDetails {
        payeeMerchantName
      }
      netBankingDetails {
        payeeName
      }
      # Include all necessary fields for display
    }
  }
`;

export const GET_CATEGORY_SPENDING_SUMMARY_QUERY = gql`
  query GetCategorySpendingSummary(
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    # This query 'categorySpendingSummary' needs to be implemented on your backend.
    # It's a custom query that would likely aggregate transaction data.
    categorySpendingSummary(dateFrom: $dateFrom, dateTo: $dateTo) {
      category
      totalAmount # This should be Decimal from backend, map to string/number in frontend
      # percentage # Backend can calculate this or frontend can
    }
  }
`;
// === END ANALYTICS QUERIES ===


// Add other queries/mutations as needed