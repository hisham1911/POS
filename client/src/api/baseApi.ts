import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../store"

const API_URL = import.meta.env.VITE_API_URL

// Base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return headers
  },
})

// Base query with re-auth logic
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    // Token expired - logout
    api.dispatch({ type: "auth/logout" })
    window.location.href = "/login"
  }

  return result
}

// Create the base API
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products", "Categories", "Orders", "Shifts", "User"],
  endpoints: () => ({}),
})
