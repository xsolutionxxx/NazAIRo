export default class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static NotFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static Forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static UnauthorizedError(message = "Unauthorized user") {
    return new ApiError(401, message);
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
}
