import { AuthoredModel } from '../AuthoredModel';
import BlogPostView from './BlogPostView';

/** Blog post model */
export default class BlogPostModel implements AuthoredModel {
  public readonly title: string;

  public readonly authorName: string;

  public readonly content: string;

  /** UTC timestamp `Date.now()` for when the post was created */
  public readonly dateCreated: number;

  /** UTC timestamp `Date.now()` for when the was last modified */
  public readonly dateLastModified: number;

  /** human readable part of the url path */
  public readonly path: string;

  /** globally unique part of the path */
  public readonly slug: string;

  private constructor({
    title,
    authorName,
    content,
    dateCreated,
    dateLastModified,
    path,
    slug,
  }: {
    title: string
    authorName: string,
    content: string,
    dateCreated: number,
    dateLastModified: number,
    path: string,
    slug: string,
  }) {
    this.title = title;
    this.authorName = authorName;
    this.content = content;
    this.dateCreated = dateCreated;
    this.dateLastModified = dateLastModified;
    this.path = path;
    this.slug = slug;
  }

  /** For creating a new blog */
  public static forPost({
    title,
    authorName,
    content,
    slug,
  }: {
    title: string
    authorName: string,
    content: string,
    slug: string,
  }): BlogPostView {
    const encodedTitle = encodeURIComponent(title);
    const path = `/${slug}/${encodedTitle}`;
    const dateCreated = Date.now();
    const dateLastModified = dateCreated;
    const model = new BlogPostModel({
      title,
      authorName,
      content,
      dateCreated,
      dateLastModified,
      path,
      slug,
    });

    return model;
  }

  /** For reading blog */
  public static forGet({
    title,
    authorName,
    content,
    dateCreated,
    dateLastModified,
    path,
    slug,
  }: {
    title: string
    authorName: string,
    content: string,
    dateCreated: number,
    dateLastModified: number,
    path: string,
    slug: string,
  }): BlogPostView {
    const model = new BlogPostModel({
      title,
      authorName,
      content,
      dateCreated,
      dateLastModified,
      path,
      slug,
    });

    return model;
  }

  /** For deleting a blog */
  public static forDelete(blogToDelete: BlogPostView): BlogPostView {
    const model = new BlogPostModel({
      title: '[deleted]',
      authorName: '[deleted]',
      content: '[deleted]',
      dateCreated: blogToDelete.dateCreated,
      dateLastModified: Date.now(),
      path: blogToDelete.path,
      slug: blogToDelete.slug,
    });

    return model;
  }

  /** For updating a blog */
  public static forPut({
    title,
    content,
    curBlog,
  }: {
    title: string
    content: string,
    curBlog: BlogPostView
  }): BlogPostView {
    const model = new BlogPostModel({
      title,
      content,
      authorName: curBlog.authorName,
      dateCreated: curBlog.dateCreated,
      dateLastModified: Date.now(),
      path: curBlog.path,
      slug: curBlog.slug,
    });

    return model;
  }
}
