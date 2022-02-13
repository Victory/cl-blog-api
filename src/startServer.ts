import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import HomeController from './controller/HomeController';
import LoginController from './controller/LoginController';
import CSLogger from './CSLogger';
import BlogController from './controller/BlogController';

/** Start the express app and return a promise of the server. */
const startServer = (port: number): Server => {
  const app = express();
  // const loginController = new LoginController();

  // app consumes json
  app.use(bodyParser.json());
  // app return's json
  app.use((_, res, next) => {
    res.header('content-type', 'application/json');
    next();
  });

  // setup rounts
  app.get('/', HomeController.home);
  app.post('/login', LoginController.login);
  app.get('/logout', LoginController.logout);
  app.get('/blogs', BlogController.getAll);
  app.post('/blog', BlogController.post);
  app.get('/blog/:slug([a-f0-9]+)', BlogController.get);

  // Launch listening server on port
  const server = app.listen(port, () => {
    CSLogger.log(`     App listening on https://localhost:${port}!`);
  });

  return server;
};

export default startServer;
