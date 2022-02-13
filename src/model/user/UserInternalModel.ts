/** Model for a user that can be passed via the api (i.e. no password or bearer token is sentk) */
interface UserPublicModel {
  readonly name: string;
  bearerToken: string;
  readonly password: string;
}

export default UserPublicModel;
