import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  baseQuery,
  reducerPath: "main",
  tagTypes: ["Accounts", "Transactions", "Portfolio", "Watchlist", "Trades"],
  endpoints: (build) => ({
    // Auth
    register: build.mutation({
      query: (body) => ({ url: "auth/register", method: "POST", body }),
    }),
    login: build.mutation({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
    }),

    // Accounts
    getAccounts: build.query({
      query: () => "api/accounts",
      providesTags: ["Accounts"],
    }),
    getAccountSummary: build.query({
      query: () => "api/accounts/summary",
      providesTags: ["Accounts"],
    }),
    createAccount: build.mutation({
      query: (body) => ({ url: "api/accounts", method: "POST", body }),
      invalidatesTags: ["Accounts"],
    }),
    deleteAccount: build.mutation({
      query: (id) => ({ url: `api/accounts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Accounts"],
    }),

    // Transactions
    getTransactions: build.query({
      query: (params) => ({ url: "api/transactions", params }),
      providesTags: ["Transactions"],
    }),
    createTransaction: build.mutation({
      query: (body) => ({ url: "api/transactions", method: "POST", body }),
      invalidatesTags: ["Transactions", "Accounts"],
    }),
    deleteTransaction: build.mutation({
      query: (id) => ({ url: `api/transactions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Transactions", "Accounts"],
    }),
    getMonthlySummary: build.query({
      query: (months = 12) => `api/transactions/summary/monthly?months=${months}`,
      providesTags: ["Transactions"],
    }),
    getCategoryBreakdown: build.query({
      query: ({ type = "expense", months = 1 } = {}) =>
        `api/transactions/summary/categories?type=${type}&months=${months}`,
      providesTags: ["Transactions"],
    }),

    // Stocks
    getStockQuote: build.query({
      query: ({ ticker, period = "1mo" }) =>
        `api/stocks/quote/${ticker}?period=${period}`,
    }),
    searchStocks: build.query({
      query: (query) => `api/stocks/search/${query}`,
    }),
    getStockPrediction: build.query({
      query: (ticker) => `api/stocks/predict/${ticker}`,
    }),

    // Watchlist
    getWatchlist: build.query({
      query: () => "api/stocks/watchlist",
      providesTags: ["Watchlist"],
    }),
    addToWatchlist: build.mutation({
      query: (body) => ({ url: "api/stocks/watchlist", method: "POST", body }),
      invalidatesTags: ["Watchlist"],
    }),
    removeFromWatchlist: build.mutation({
      query: (symbol) => ({ url: `api/stocks/watchlist/${symbol}`, method: "DELETE" }),
      invalidatesTags: ["Watchlist"],
    }),

    // Portfolio
    getPortfolio: build.query({
      query: () => "api/stocks/portfolio",
      providesTags: ["Portfolio"],
    }),
    buyStock: build.mutation({
      query: (body) => ({ url: "api/stocks/trade/buy", method: "POST", body }),
      invalidatesTags: ["Portfolio", "Trades"],
    }),
    sellStock: build.mutation({
      query: (body) => ({ url: "api/stocks/trade/sell", method: "POST", body }),
      invalidatesTags: ["Portfolio", "Trades"],
    }),
    getTradeHistory: build.query({
      query: () => "api/stocks/trades",
      providesTags: ["Trades"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetAccountsQuery,
  useGetAccountSummaryQuery,
  useCreateAccountMutation,
  useDeleteAccountMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useDeleteTransactionMutation,
  useGetMonthlySummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetStockQuoteQuery,
  useSearchStocksQuery,
  useGetStockPredictionQuery,
  useGetWatchlistQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useGetPortfolioQuery,
  useBuyStockMutation,
  useSellStockMutation,
  useGetTradeHistoryQuery,
} = api;
