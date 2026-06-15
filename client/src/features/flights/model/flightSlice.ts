import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { flightApi } from "../api/flightApi";
import type {
  IAirline,
  IAirport,
  IFlight,
  IFlightSearchParams,
} from "@entities/flight/types/IFlight";

interface FlightState {
  flights: IFlight[];
  returnFlights: IFlight[] | null;
  total: number;
  totalPages: number;
  currentPage: number;
  airports: IAirport[];
  airlines: IAirline[];
  searchParams: IFlightSearchParams | null;
  loading: boolean;
  airportsLoading: boolean;
  error: string | null;
}

const initialState: FlightState = {
  flights: [],
  returnFlights: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  airports: [],
  airlines: [],
  searchParams: null,
  loading: false,
  airportsLoading: false,
  error: null,
};

export const searchFlights = createAsyncThunk(
  "flights/search",
  async (params: IFlightSearchParams, { rejectWithValue }) => {
    try {
      const res = await flightApi.search(params);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Search failed");
    }
  },
);

export const fetchAirports = createAsyncThunk(
  "flights/fetchAirports",
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const res = await flightApi.getAirports(search);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Failed to load airports");
    }
  },
);

export const fetchAirlines = createAsyncThunk(
  "flights/fetchAirlines",
  async (_, { rejectWithValue }) => {
    try {
      const res = await flightApi.getAirlines();
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Failed to load airlines");
    }
  },
);

const flightSlice = createSlice({
  name: "flights",
  initialState,
  reducers: {
    setSearchParams(state, action: PayloadAction<IFlightSearchParams>) {
      state.searchParams = action.payload;
    },
    clearResults(state) {
      state.flights = [];
      state.returnFlights = null;
      state.total = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = action.payload.flights;
        state.returnFlights = action.payload.returnFlights;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAirports.pending, (state) => {
        state.airportsLoading = true;
      })
      .addCase(fetchAirports.fulfilled, (state, action) => {
        state.airportsLoading = false;
        state.airports = action.payload;
      })
      .addCase(fetchAirports.rejected, (state) => {
        state.airportsLoading = false;
      })
      .addCase(fetchAirlines.fulfilled, (state, action) => {
        state.airlines = action.payload;
      });
  },
});

export const { setSearchParams, clearResults } = flightSlice.actions;
export default flightSlice.reducer;
