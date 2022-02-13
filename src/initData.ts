import CryptoUtil from './CryptoUtil';
import db from './db';
import BlogPostModel from './model/blogs/BlogPostModel';
import ModelUtil from './model/ModelUtil';
import UserModel from './model/user/UserModel';

const initData = async () => {
  const users = [
    UserModel.asInternal({
      name: 'Alice',
      bearerToken: '',
      password: CryptoUtil.encrypt('Alice123'),
    }),
    UserModel.asInternal({
      name: 'Bob',
      bearerToken: '',
      password: CryptoUtil.encrypt('Bob123'),
    }),
    UserModel.asInternal({
      name: 'Eve',
      bearerToken: '',
      password: CryptoUtil.encrypt('Eve123'),
    }),
  ];

  // Persists a user model
  const createUsers = users.map((user) => db.setObject(`users/${user.name}`, user));
  await Promise.all(createUsers);

  const blogs = [
    BlogPostModel.forPost({
      authorSlug: 'Bob',
      content: 'Fishing in the sea requires...',
      title: 'How to fish in the sea',
      slug: await ModelUtil.newSlug(),
    }),
    BlogPostModel.forPost({
      authorSlug: 'Bob',
      content: 'Baiting a hook by...',
      title: 'Fishing with worms',
      slug: await ModelUtil.newSlug(),
    }),
    BlogPostModel.forPost({
      authorSlug: 'Eve',
      content: 'Best camping spot I know..',
      title: 'Camping and fishing in the morning',
      slug: await ModelUtil.newSlug(),
    }),
  ];

  const createBlogs = blogs.map((blog) => db.setObject(`blogs/${blog.slug}`, blog));
  await Promise.all(createBlogs);
};

export default initData;
