import Unserializable from '../Unserializable';
import UserPublicModel from './UserPublicModel';

export default class UserModel {
  public readonly name: string;

  public readonly slug: string;

  public readonly bearerToken: string | Unserializable;

  public readonly password: string | Unserializable;

  private constructor({
    name,
    slug,
    bearerToken,
    password,
  }: {
    name: string,
    slug: string,
    bearerToken: string | Unserializable,
    password: string | Unserializable,
  }) {
    this.name = name;
    this.slug = slug;
    this.bearerToken = bearerToken;
    this.password = password;
  }

  /** Get a public user */
  public static asPublic({
    name,
    slug,
  }: {
    name: string,
    slug: string,
  }): UserPublicModel {
    return new UserModel({
      name,
      slug,
      password: Unserializable.instance,
      bearerToken: Unserializable.instance,
    });
  }

  /** Used to verify username password, etc.. */
  public static asInternal({
    name,
    slug,
    bearerToken,
    password,
  }: {
    name: string,
    slug: string,
    bearerToken: string,
    password: string,
  }): UserModel {
    return new UserModel({
      name,
      slug,
      password,
      bearerToken,
    });
  }

  /** Get view as a "Deleted" model */
  public static getDeletedUser(): UserPublicModel {
    return new UserModel({
      name: '[deleted]',
      slug: '[deleted]',
      password: Unserializable.instance,
      bearerToken: Unserializable.instance,
    });
  }
}
