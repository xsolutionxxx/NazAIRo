import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { hotelApi } from "../api/hotelApi";
import type { IHotel, IHotelSearchParams } from "@entities/hotel/types/IHotel";

interface HotelState {
  hotels: IHotel[];
  total: number;
  totalPages: number;
  currentPage: number;
  nights: number;
  cities: { city: string; country: string }[];
  loading: boolean;
  citiesLoading: boolean;
  error: string | null;
}

const initialState: HotelState = {
  hotels: [], total: 0, totalPages: 0, currentPage: 1, nights: 1,
  cities: [], loading: false, citiesLoading: false, error: null,
};

export const searchHotels = createAsyncThunk(
  "hotels/search",
  async (params: IHotelSearchParams, { rejectWithValue }) => {
    try {
      const res = await hotelApi.search(params);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Search failed");
    }
  },
);

export const fetchCities = createAsyncThunk(
  "hotels/fetchCities",
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const res = await hotelApi.getCities(search);
      return res.data;
    } catch (e: any) {
      return rejectWithValue("Failed to load cities");
    }
  },
);

const hotelSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    clearResults(state) { state.hotels = []; state.total = 0; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchHotels.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(searchHotels.fulfilled, (s, a) => {
        s.loading = false;
        s.hotels = a.payload.hotels;
        s.total = a.payload.total;
        s.totalPages = a.payload.totalPages;
        s.currentPage = a.payload.page;
        s.nights = a.payload.nights;
      })
      .addCase(searchHotels.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchCities.pending,   (s) => { s.citiesLoading = true; })
      .addCase(fetchCities.fulfilled, (s, a) => { s.citiesLoading = false; s.cities = a.payload; })
      .addCase(fetchCities.rejected,  (s) => { s.citiesLoading = false; });
  },
});

export const { clearResults } = hotelSlice.actions;
export default hotelSlice.reducer;
