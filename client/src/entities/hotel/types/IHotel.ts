export interface IHotel {
  id: string;
  name: string;
  description?: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  stars: number;
  imageUrls: string[];
  amenities: string[];
  latitude?: number;
  longitude?: number;
  pricePerNight: number | null;
  totalPrice: number | null;
  availableRooms: number;
  nights: number;
}

export interface IRoom {
  id: string;
  hotelId: string;
  roomNumber: string;
  type: string;
  description?: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  imageUrls: string[];
  isAvailable: boolean;
  isAvailableForDates?: boolean;
  totalPrice?: number;
}

export interface IHotelDetail extends IHotel {
  rooms: IRoom[];
}

export interface IHotelSearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  stars?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "stars" | "rating" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface IHotelSearchResult {
  hotels: IHotel[];
  total: number;
  page: number;
  totalPages: number;
  nights: number;
}
