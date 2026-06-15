export default class UserDto {
  id;
  email;
  firstName;
  lastName;
  phone;
  address;
  avatarUrl;
  isActivated;
  role;

  constructor(model) {
    this.id          = model.id;
    this.email       = model.email;
    this.firstName   = model.firstName;
    this.lastName    = model.lastName;
    this.phone       = model.phone;
    this.address     = model.address;
    this.avatarUrl   = model.avatarUrl;
    this.isActivated = model.isActivated;
    this.role        = model.role;
  }
}
