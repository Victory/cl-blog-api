import { AuthoredModel } from '../AuthoredModel';

export default class CommentModel implements AuthoredModel {
  /** Author of this comment */
  public readonly authorName: string;

  /** Content for this comment */
  public readonly content: string;

  /** Slug for this comment */
  public readonly slug: string;

  /** Slug of the blog that this is a comment on */
  public readonly blogSlug: string;

  /** Slug of of the comment that this a reply to or null or if it is top level */
  public readonly parentSlug: string | null;

  /** The globally montonically increasing index, used for pagination */
  public readonly globalIndex: number;

  /** When this post was created */
  public readonly dateCreated: number;

  /** Set to true if this post has children */
  public hasChildren: boolean;

  private constructor({
    authorName,
    content,
    slug,
    globalIndex,
    blogSlug,
    parentSlug,
    dateCreated,
    hasChildren,
  }: {
    authorName: string,
    content: string,
    globalIndex: number,
    slug: string,
    blogSlug: string,
    parentSlug: string | null,
    dateCreated: number;
    hasChildren: boolean,
  }) {
    this.authorName = authorName;
    this.content = content;
    this.slug = slug;
    this.blogSlug = blogSlug;
    this.parentSlug = parentSlug;
    this.globalIndex = globalIndex;
    this.dateCreated = dateCreated;
    this.hasChildren = hasChildren;
  }

  /** Get a new comment model to post */
  public static forPost({
    authorName,
    content,
    slug,
    globalIndex,
    blogSlug,
    parentSlug,
  }: {
    authorName: string,
    content: string,
    globalIndex: number,
    slug: string,
    blogSlug: string,
    parentSlug: string | null,
  }) {
    const dateCreated = Date.now();
    const hasChildren = false;

    return new CommentModel({
      authorName,
      content,
      slug,
      globalIndex,
      blogSlug,
      parentSlug,
      dateCreated,
      hasChildren,
    });
  }

  /** Get a new comment model to view (e.g. created from the database) */
  public static forGet({
    authorName,
    content,
    slug,
    globalIndex,
    blogSlug,
    parentSlug,
    dateCreated,
    hasChildren,
  }: {
    authorName: string,
    content: string,
    globalIndex: number,
    slug: string,
    blogSlug: string,
    parentSlug: string | null,
    dateCreated: number,
    hasChildren: boolean,
  }) {
    return new CommentModel({
      authorName,
      content,
      slug,
      globalIndex,
      blogSlug,
      parentSlug,
      dateCreated,
      hasChildren,
    });
  }

  /** Create a version of the model with children marked as true  */
  public static forMarkAsHashChildren(comment: CommentModel) {
    return new CommentModel({
      ...comment,
      hasChildren: true,
    });
  }

  /** Return a copy of comment with the content and author '[deleted]' */
  public static forDelete(comment: CommentModel) {
    return new CommentModel({
      ...comment,
      authorName: '[deleted]',
      content: '[deleted]',
    });
  }
}
