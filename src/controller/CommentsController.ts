import express from 'express';
import db from '../db';
import CommentModel from '../model/comments/CommentModel';
import ModelUtil from '../model/ModelUtil';
import Authorization from './Authorization';
import BlogController from './BlogController';
import SanitizeInput from './SanatizeInput';

export default class CommentsController {
  /** Post a blog comment (optionally set comment parent slug) */
  public static async post(req: express.Request, res: express.Response) {
    const { blogSlug, parentSlug } = req.params;
    const user = await Authorization.isAuthorized({
      req,
      action: 'post',
    });

    if (!user) {
      res.statusCode = 401;
      res.send({ isAuthorized: false });
      return;
    }

    const { content } = req.body;
    if (!content) {
      res.statusCode = 400;
      res.send({ msg: 'Content is required' });
      return;
    }

    db.runTransaction(async () => {
      const blog = await BlogController.getBlogBySlug(blogSlug);
      if (!blog || blog.title === '[deleted]') {
        res.statusCode = 404;
        res.send({ msg: 'blog not found' });
        return;
      }

      // validate that parent slug if present
      let parentComment: CommentModel | null = null;
      if (parentSlug && ModelUtil.isValidSlug(parentSlug)) {
        parentComment = CommentModel.forMarkAsHashChildren(await db.getObject(`comments/${parentSlug}`));
        if (!parentComment || parentComment.content === '[deleted]') {
          res.statusCode = 404;
          res.send({ msg: 'blog not found' });
          return;
        }
      }

      const comment = CommentModel.forPost({
        authorName: user.name,
        blogSlug: blog.slug,
        content: SanitizeInput.sanitize(content),
        globalIndex: ModelUtil.getIndex(),
        parentSlug: parentSlug || null,
        slug: await ModelUtil.newSlug(),
      });

      await db.setObject(`comments/${comment.slug}`, comment);
      if (parentComment) {
        await db.setObject(`comments/${parentComment.slug}`, parentComment);
      }

      const view = CommentModel.forGet(await db.getObject(`comments/${comment.slug}`));
      res.statusCode = 201;
      res.send(view);
    });
  }

  /** Get blog comments by blog slug and optional parent slug */
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const { blogSlug, parentSlug } = req.params;
    const { startIndex } = req.query;

    if (!blogSlug) {
      res.statusCode = 404;
      res.send({ msg: 'no blog slug' });
      return;
    }

    const filterPredicate = (comment: CommentModel) => {
      // only pull from the target blog
      const isCorrectBlog = comment.blogSlug === blogSlug;
      const targetParent = parentSlug || null;
      // only pull from the correct parent comment (or top comment if null)
      const isCorrectParent = comment.parentSlug === targetParent;
      const targetStartIndex = startIndex || -1;
      // only pull comments that have a larger index (e.g. for "load more" style pagination)
      const isLargeEnoughIndex = comment.globalIndex > targetStartIndex;
      return isCorrectBlog && isCorrectParent && isLargeEnoughIndex;
    };

    const commentBlobs = await db.getObjects<CommentModel>({
      keyPrefix: 'comments/',
      filterPredicate,
    });
    const view = commentBlobs.map((comment) => CommentModel.forGet(comment));
    view.sort((lhs, rhs) => lhs.dateCreated - rhs.dateCreated);

    res.statusCode = 200;
    res.send(view);
  }

  /** Delete a comment */
  public static async delete(req: express.Request, res: express.Response) {
    const { commentSlug } = req.params;

    if (!commentSlug || !ModelUtil.isValidSlug(commentSlug)) {
      res.statusCode = 404;
      res.send({ msg: 'no comment slug' });
      return;
    }

    const commentBlob = await db.getObject<CommentModel>(`comments/${commentSlug}`);
    if (!commentBlob) {
      res.statusCode = 404;
      res.send({ msg: 'no such comment' });
      return;
    }
    const toDelete = CommentModel.forGet(commentBlob);
    const user = await Authorization.isAuthorizedToModified({
      req,
      res,
      model: toDelete,
    });
    if (!user) {
      res.statusCode = 401;
      res.send({ msg: 'you are not the owner' });
      return;
    }

    await db.setObject(`comments/${toDelete.slug}`, CommentModel.forDelete(toDelete));
    const view = CommentModel.forGet(await db.getObject(`comments/${commentSlug}`));

    res.statusCode = 200;
    res.send(view);
  }
}
