export default class UserDto {
  id;
  email;
  firstName;
  lastName;
  phone;
  address;
  avatarUrl;
  backgroundUrl;
  isActivated;
  role;

  constructor(model) {
    this.id            = model.id;
    this.email         = model.email;
    this.firstName     = model.firstName;
    this.lastName      = model.lastName;
    this.phone         = model.phone;
    this.address       = model.address;
    this.avatarUrl     = model.avatarUrl;
    this.backgroundUrl = model.backgroundUrl;
    this.isActivated   = model.isActivated;
    this.role          = model.role;
  }
}
