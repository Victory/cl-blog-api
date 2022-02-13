import express from 'express';
import CSLogger from '../CSLogger';
import db from '../db';
import BlogPostModel from '../model/blogs/BlogPostModel';
import BlogPostView from '../model/blogs/BlogPostView';
import ModelUtil from '../model/ModelUtil';
import UserModel from '../model/user/UserModel';
import Authorization from './Authorization';
import SanitizeInput from './SanatizeInput';

export default class BlogController {
  /** Get all blogs */
  public static async getAll(_: express.Request, res: express.Response) {
    const blogBlobs = await db.getObjects<BlogPostView>({
      keyPrefix: 'blogs/',
    });

    const view = blogBlobs.map((blob) => BlogPostModel.forGet(blob));
    res.statusCode = 200;
    res.send(view);
  }

  /** Get a blog post by slug */
  public static async get(req: express.Request, res: express.Response) {
    const { slug } = req.params;
    if (!ModelUtil.isValidSlug(slug)) {
      console.log('no va', slug);
      res.statusCode = 401;
      res.send({ isNotFound: true });
      return;
    }

    const result = BlogPostModel.forGet(await db.getObject(`blogs/${slug}`));
    if (!result) {
      console.log('no result');
      res.statusCode = 401;
      res.send({ isNotFound: true });
      return;
    }

    res.statusCode = 200;
    res.send(result);
  }

  /** Post a blog post, requires user is logge in. */
  public static async post(req: express.Request, res: express.Response) {
    const user = await Authorization.isAuthorized({
      req,
      res,
      action: 'post',
    });
    if (!user) {
      res.statusCode = 401;
      res.send({});
      return;
    }

    const { content, title } = req.body;

    if (!content || !title) {
      res.statusCode = 400;
      res.send({ msg: 'Content and title are required' });
      return;
    }

    // post the blog for the author
    const bp = await db.runTransaction(async () => {
      const author = UserModel.asPublic(await db.getObject(`users/${user.name}`));
      const newPost = BlogPostModel.forPost({
        content: SanitizeInput.sanitize(content),
        title: SanitizeInput.sanitize(title),
        authorSlug: author.name,
        slug: await ModelUtil.newSlug(),
      });
      await db.setObject(`blogs/${newPost.slug}`, newPost);
      return newPost;
    });

    const result = BlogPostModel.forGet(await db.getObject(`blogs/${bp.slug}`));
    res.statusCode = 201;
    res.send(result);

    CSLogger.log('blog', BlogPostModel.forGet(await db.getObject(`blogs/${bp.path}`)));
    CSLogger.log('author', UserModel.asPublic(await db.getObject(`users/${bp.authorSlug}`)));
  }
}
