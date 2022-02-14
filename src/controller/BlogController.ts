import express from 'express';
import db from '../db';
import BlogPostModel from '../model/blogs/BlogPostModel';
import BlogPostView from '../model/blogs/BlogPostView';
import ModelUtil from '../model/ModelUtil';
import UserModel from '../model/user/UserModel';
import Authorization from './Authorization';
import SanitizeInput from './SanatizeInput';

export default class BlogController {
  /** Get all blogs sorted by date created */
  public static async getAll(_: express.Request, res: express.Response) {
    const blogBlobs = await db.getObjects<BlogPostView>({
      keyPrefix: 'blogs/',
    });

    const view = blogBlobs.map((blob) => BlogPostModel.forGet(blob));
    view.sort((lhs, rhs) => lhs.dateCreated - rhs.dateCreated);
    res.statusCode = 200;
    res.send(view);
  }

  /** Get a blog post by slug */
  public static async get(req: express.Request, res: express.Response) {
    const { slug } = req.params;
    const blog = await BlogController.getBlogBySlug(slug);

    if (!blog) {
      res.statusCode = 401;
      res.send({ isNotFound: true });
      return;
    }
    res.statusCode = (blog.title !== '[deleted]') ? 200 : 404;
    res.send(blog);
  }

  /** Get a blog with given slug or null. */
  public static async getBlogBySlug(slug: string): Promise<BlogPostView | null> {
    if (!ModelUtil.isValidSlug(slug)) {
      return null;
    }
    const blog = BlogPostModel.forGet(await db.getObject(`blogs/${slug}`));
    return blog || null;
  }

  /** Post a blog post, requires user is logged in. */
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
        authorName: author.name,
        slug: await ModelUtil.newSlug(),
      });
      await db.setObject(`blogs/${newPost.slug}`, newPost);
      return newPost;
    });

    const result = BlogPostModel.forGet(await db.getObject(`blogs/${bp.slug}`));
    res.statusCode = 201;
    res.send(result);
  }

  /** Update a blog post, requires user is logged in. And blog being creator of the blog */
  public static async put(req: express.Request, res: express.Response) {
    const { slug } = req.params;
    if (!slug) {
      res.statusCode = 404;
      res.send({ msg: 'Slug is required' });
      return;
    }

    const curBlog = await BlogController.getBlogBySlug(slug);
    if (!curBlog) {
      res.statusCode = 404;
      res.send({ isNotFound: true });
      return;
    }

    const { content, title } = req.body;
    if (!content || !title) {
      res.statusCode = 400;
      res.send({ msg: 'Content and title are required' });
      return;
    }

    const user = await Authorization.isAuthorizedToModified({
      req,
      res,
      model: curBlog,
    });
    if (!user) {
      res.statusCode = 401;
      res.send({});
      return;
    }

    const bp = await db.runTransaction(async () => {
      const newBlog = BlogPostModel.forPut({
        content: SanitizeInput.sanitize(content),
        title: SanitizeInput.sanitize(title),
        curBlog,
      });
      await db.setObject(`blogs/${newBlog.slug}`, newBlog);
      return newBlog;
    });

    const result = BlogPostModel.forGet(await db.getObject(`blogs/${bp.slug}`));
    res.statusCode = 201;
    res.send(result);
  }

  /** Delete a blog post */
  public static async delete(req: express.Request, res: express.Response) {
    const { slug } = req.params;
    if (!slug) {
      res.statusCode = 404;
      res.send({ msg: 'Slug is required' });
      return;
    }

    const curBlog = await BlogController.getBlogBySlug(slug);
    if (!curBlog) {
      res.statusCode = 404;
      res.send({ isNotFound: true });
      return;
    }

    const user = await Authorization.isAuthorizedToModified({
      req,
      res,
      model: curBlog,
    });
    if (!user) {
      res.statusCode = 401;
      res.send({});
      return;
    }

    const bp = await db.runTransaction(async () => {
      const newBlog = BlogPostModel.forDelete(curBlog);
      await db.setObject(`blogs/${newBlog.slug}`, newBlog);
      return newBlog;
    });

    const result = BlogPostModel.forGet(await db.getObject(`blogs/${bp.slug}`));
    res.statusCode = 201;
    res.send(result);
  }
}
