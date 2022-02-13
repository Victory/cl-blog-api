import Unserializable from '../Unserializable';
import UserPublicModel from './UserPublicModel';
import UserInternalModel from './UserInternalModel';

export default class UserModel {
  /** Unique username must only contain A-Za-z0-9 */
  public readonly name: string;

  /** Bearer token for authorization */
  public bearerToken: string | Unserializable;

  public readonly password: string | Unserializable;

  private constructor({
    name,
    bearerToken,
    password,
  }: {
    name: string,
    bearerToken: string | Unserializable,
    password: string | Unserializable,
  }) {
    this.name = name;
    this.bearerToken = bearerToken;
    this.password = password;
  }

  /** Get a public user */
  public static asPublic({
    name,
  }: {
    name: string,
  }): UserPublicModel {
    return new UserModel({
      name,
      password: Unserializable.instance,
      bearerToken: Unserializable.instance,
    });
  }

  /** Used to verify username password, etc.. */
  public static asInternal({
    name,
    bearerToken,
    password,
  }: {
    name: string,
    bearerToken: string,
    password: string,
  }): UserInternalModel {
    return new UserModel({
      name,
      password,
      bearerToken,
    }) as UserInternalModel;
  }

  /** Get "Deleted" user model */
  public static getDeletedUser(): UserPublicModel {
    return new UserModel({
      name: '[deleted]',
      password: Unserializable.instance,
      bearerToken: Unserializable.instance,
    });
  }

  /** Get the "Guest" user model (i.e. user non-logged in users guet) */
  public static getGuestUser(): UserPublicModel {
    return new UserModel({
      name: 'Guest',
      password: Unserializable.instance,
      bearerToken: Unserializable.instance,
    });
  }
}
