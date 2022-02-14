import express from 'express';
import db from '../db';
import { AuthoredModel } from '../model/AuthoredModel';
import UserInternalModel from '../model/user/UserInternalModel';
import UserModel from '../model/user/UserModel';
import UserPublicModel from '../model/user/UserPublicModel';

export default class Authorization {
  /** Return true if authorized modified/delete the model */
  public static async isAuthorizedToModified({
    req,
    res,
    model,
  }: {
    req: express.Request,
    res: express.Response
    model: AuthoredModel
  }): Promise<UserPublicModel | null> {
    const user = await Authorization.getUserFromRequest(req);

    if (user && user.name === model.authorName) {
      return user;
    }

    res.statusCode = 401;
    res.send({ isAuthorized: false });
    return null;
  }

  /** Return true if the user is authorized to post or get */
  public static async isAuthorized({
    req,
    res,
    action,
  }: {
    req: express.Request,
    res: express.Response
    action: 'get' | 'post'
  }): Promise<UserPublicModel | null> {
    const user = await Authorization.getUserFromRequest(req);
    if (action === 'get') {
      return (user) || UserModel.getGuestUser();
    }

    if (action === 'post' && user) {
      return user;
    }

    res.statusCode = 401;
    res.send({ isAuthorized: false });
    return null;
  }

  /** Get the user by request, or null if the user not logged in */
  public static async getUserFromRequest(req: express.Request): Promise<UserInternalModel> {
    const bits = `${req.headers.authorization}`.split(' ');
    if (bits.length !== 2 || bits[0] !== 'Bearer') {
      return null;
    }
    const bearerToken = bits[1];

    const found = await db.getObjects<UserInternalModel>({
      keyPrefix: 'users/',
      filterPredicate: (u) => u.bearerToken === bearerToken,
    });

    if (!found) {
      return null;
    }

    return UserModel.asInternal(found[0]);
  }
}