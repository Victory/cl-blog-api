import express from 'express';
import CryptoUtil from '../CryptoUtil';
import db from '../db';
import ModelUtil from '../model/ModelUtil';
import UserInternalModel from '../model/user/UserInternalModel';
import UserModel from '../model/user/UserModel';
import Authorization from './Authorization';
import UserCrendtials from './transport/UserCredentials';

export default class LoginController {
  public static async login(req: express.Request, res: express.Response) {
    const creds: UserCrendtials = req.body;
    try {
      // requires valid slug
      if (!ModelUtil.isValidSlug(creds.userName)) {
        throw new Error('invalid username');
      }

      const userBlob = await db.getObject<UserInternalModel>(`users/${creds.userName}`);
      // requires user exists
      if (!userBlob) {
        throw new Error('user not found');
      }
      const user = UserModel.asInternal(userBlob);

      const isCorrectPassword = CryptoUtil.validate({
        clearText: creds.password,
        cipherText: user.password,
      });
      // requires correct password
      if (!isCorrectPassword) {
        throw new Error('incorrect password');
      }

      user.bearerToken = await ModelUtil.newSlug();
      await db.setObject(`users/${user.name}`, user);
      res.send({ bearerToken: user.bearerToken });
    } catch (e) {
      res.statusCode = 401;
      res.send({ bearerToken: '' });
    }
  }

  /** Logout user */
  public static async logout(req: express.Request, res: express.Response) {
    try {
      const user = await Authorization.getUserFromRequest(req);
      // already logged out
      if (!user) {
        res.statusCode = 400;
        res.send({ bearerToken: '' });
        return;
      }

      user.bearerToken = '';
      await db.setObject(`users/${user.name}`, user);

      res.statusCode = 200;
      res.send({ bearerToken: '' });
    } catch (e) {
      res.statusCode = 400;
      res.send({ bearerToken: '' });
    }
  }
}
