import express from 'express';

export default class HomeController {
  /** Send the api version */
  public static home(_: express.Request, res: express.Response) {
    res.send(JSON.stringify({ apiVersion: '1.0' }));
  }
}
