import CryptoUtil from './CryptoUtil';
import db from './db';
import BlogPostModel from './model/blogs/BlogPostModel';
import CommentModel from './model/comments/CommentModel';
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
      authorName: 'Bob',
      content: 'Fishing in the sea requires...',
      title: 'How to fish in the sea',
      slug: await ModelUtil.newSlug(),
    }),
    BlogPostModel.forPost({
      authorName: 'Bob',
      content: 'Baiting a hook by...',
      title: 'Fishing with worms',
      slug: await ModelUtil.newSlug(),
    }),
    BlogPostModel.forPost({
      authorName: 'Eve',
      content: 'Best camping spot I know..',
      title: 'Camping and fishing in the morning',
      slug: await ModelUtil.newSlug(),
    }),
  ];

  const createBlogs = blogs.map((blog) => db.setObject(`blogs/${blog.slug}`, blog));
  await Promise.all(createBlogs);

  const parentSlug = await ModelUtil.newSlug();
  const parentSlug2 = await ModelUtil.newSlug();

  const comments = [

    CommentModel.forMarkAsHashChildren(
      CommentModel.forPost({
        authorName: 'Alice',
        blogSlug: blogs[0].slug,
        content: `Nice post about ${blogs[0].title}`,
        globalIndex: ModelUtil.getIndex(),
        parentSlug: null,
        slug: parentSlug,
      }),
    ),
    CommentModel.forPost({
      authorName: 'Guest',
      blogSlug: blogs[0].slug,
      content: `I will reply to Nice post about ${blogs[0].title}`,
      globalIndex: ModelUtil.getIndex(),
      parentSlug,
      slug: await ModelUtil.newSlug(),
    }),
    CommentModel.forMarkAsHashChildren(
      CommentModel.forPost({
        authorName: 'Guest',
        blogSlug: blogs[0].slug,
        content: `I will reply to Nice post about ${blogs[0].title}`,
        globalIndex: ModelUtil.getIndex(),
        parentSlug,
        slug: parentSlug2,
      }),
    ),
    CommentModel.forPost({
      authorName: 'Guest',
      blogSlug: blogs[0].slug,
      content: `I reply to your reply to Nice post about ${blogs[0].title}`,
      globalIndex: ModelUtil.getIndex(),
      parentSlug: parentSlug2,
      slug: await ModelUtil.newSlug(),
    }),
    CommentModel.forPost({
      authorName: 'Eve',
      blogSlug: blogs[1].slug,
      content: `Great post about ${blogs[1].title}`,
      globalIndex: ModelUtil.getIndex(),
      parentSlug: null,
      slug: await ModelUtil.newSlug(),
    }),
    CommentModel.forPost({
      authorName: 'Guest',
      blogSlug: blogs[0].slug,
      content: `I am a guest but i wanted to talk about ${blogs[0].title}`,
      globalIndex: ModelUtil.getIndex(),
      parentSlug: null,
      slug: await ModelUtil.newSlug(),
    }),
    CommentModel.forPost({
      authorName: 'Eve',
      blogSlug: blogs[0].slug,
      content: `Just a top level post to ${blogs[0].title}`,
      globalIndex: ModelUtil.getIndex(),
      parentSlug: null,
      slug: await ModelUtil.newSlug(),
    }),
  ];

  const createComments = comments.map((comment) => db.setObject(`comments/${comment.slug}`, comment));
  await Promise.all(createComments);
};

export default initData;
