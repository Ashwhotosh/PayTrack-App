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

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      amount
      transactionType # Payment method
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

export const GET_DASHBOARD_TRANSACTIONS_QUERY = gql`
  query GetDashboardTransactions(
    $limit: Int
    $offset: Int
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    transactions(
      limit: $limit,
      offset: $offset,
      dateFrom: $dateFrom,
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

// --- QUERY FOR ANALYTICS WITH INSIGHT (MODIFIED) ---
export const GET_ANALYTICS_WITH_INSIGHT_QUERY = gql`
  query GetAnalyticsWithInsight(
    # $dateFrom: DateTime // REMOVED - AI model uses full history
    # $dateTo: DateTime   // REMOVED - AI model uses full history
    $periodsAhead: Int
    $category: String
  ) {
    getAnalyticsWithInsight(
      # dateFrom: $dateFrom // REMOVED
      # dateTo: $dateTo     // REMOVED
      periodsAhead: $periodsAhead
      category: $category
    ) {
      forecastedSpending
      expenditureTip
      categoryContext
      periodsCovered
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
      flow
      timestamp # DateTime
      notes
      category
      createdAt # DateTime
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

// === QUERY FOR CHATBOT CONTEXT ===
export const GET_USER_DATA_FOR_CHATBOT_QUERY = gql`
  query GetUserDataForChatbot {
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
    }
    transactions {
      id
      amount
      flow
      transactionType
      category
      notes
      timestamp
      upiDetails {
        payeeName
        payeeUpiId
      }
      cardDetails {
        payeeMerchantName
      }
      netBankingDetails {
        payeeName
        referenceId
      }
    }
  }
`;

// === END CHATBOT CONTEXT QUERY ===

// Add other queries/mutations as needed