/** Model for a user that can be passed via the api (i.e. no password or bearer token is sentk) */
interface UserPublicModel {
  name: string;
  slug: string;
}

export default UserPublicModel;
