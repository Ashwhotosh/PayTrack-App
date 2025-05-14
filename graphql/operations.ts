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
      # Also select detail IDs if the mutation might affect cache for these details
      upiDetails {
        id # <<< ADDED
      }
      cardDetails {
        id # <<< ADDED
      }
      netBankingDetails {
        id # <<< ADDED
      }
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
      upiDetails {
        id # <<< ADDED
        payeeUpiId
        # You might also want payeeName here if needed immediately
        # payeeName
      }
      cardDetails {
        id # <<< ADDED
        # payeeMerchantName
      }
      netBankingDetails {
        id # <<< ADDED
        # payeeName
        # payeeBankName
        # referenceId
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
      transactionType
      timestamp # DateTime
      notes
      category
      createdAt # DateTime
      # Payer information (optional, but useful for context)
      # payer {
      #   id
      #   firstName
      #   lastName
      # }
      # Specific details based on type
      upiDetails {
        id
        payeeName
        payeeUpiId
        payerUpiAccount { # For displaying "Paid from Account X"
          id
          displayName
          upiId
        }
      }
      cardDetails {
        id
        payeeMerchantName
        payerCardAccount { # For displaying "Paid from Card ending in XXXX"
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
        payerBankAccount { # For displaying "Paid from Bank Account YYYY"
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