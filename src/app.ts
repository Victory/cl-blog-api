import CryptoUtil from './CryptoUtil';
import CSLogger from './CSLogger';
import db from './db';
import ModelUtil from './model/ModelUtil';
import UserModel from './model/user/UserModel';

const initData = async () => {
  const users = [
    UserModel.asInternal({
      name: 'Alice',
      bearerToken: '',
      password: CryptoUtil.encrypt('Alice123'),
      slug: await ModelUtil.newNouce(),
    }),
    UserModel.asInternal({
      name: 'Bob',
      bearerToken: '',
      password: CryptoUtil.encrypt('Bob123'),
      slug: await ModelUtil.newNouce(),
    }),
    UserModel.asInternal({
      name: 'Eve',
      bearerToken: '',
      password: CryptoUtil.encrypt('Eve123'),
      slug: await ModelUtil.newNouce(),
    }),
  ];

  // Persists a user model
  const createUsers = users.map((user) => db.setObject(`users/${user.slug}`, user));
  await Promise.all(createUsers);

  CSLogger.log(await db.getObjects<UserModel>('users'));
};

const main = async () => {
  await initData();
};

main();
