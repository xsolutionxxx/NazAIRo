import hotelService from "../service/hotel-service.js";

class HotelController {
  async search(req, res, next) {
    try {
      const result = await hotelService.searchHotels(req.validatedQuery ?? req.query);
      return res.json(result);
    } catch (e) { next(e); }
  }

  async getById(req, res, next) {
    try {
      const hotel = await hotelService.getHotelById(req.params.id, req.query);
      return res.json(hotel);
    } catch (e) { next(e); }
  }

  async getCities(req, res, next) {
    try {
      const cities = await hotelService.getCities(req.query.search);
      return res.json(cities);
    } catch (e) { next(e); }
  }

  // Admin
  async adminGetAll(req, res, next) {
    try {
      const result = await hotelService.getAllHotelsAdmin(req.query);
      return res.json(result);
    } catch (e) { next(e); }
  }

  async adminCreate(req, res, next) {
    try {
      const hotel = await hotelService.createHotel(req.body);
      return res.status(201).json(hotel);
    } catch (e) { next(e); }
  }

  async adminUpdate(req, res, next) {
    try {
      const hotel = await hotelService.updateHotel(req.params.id, req.body);
      return res.json(hotel);
    } catch (e) { next(e); }
  }

  async adminDelete(req, res, next) {
    try {
      const result = await hotelService.deleteHotel(req.params.id);
      return res.json(result);
    } catch (e) { next(e); }
  }
}

export default new HotelController();
