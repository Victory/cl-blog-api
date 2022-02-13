import BlogPostView from './BlogPostView';

/** Blog post model */
export default class BlogPostModel {
  public readonly title: string;

  public readonly authorSlug: string;

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
    authorSlug,
    content,
    dateCreated,
    dateLastModified,
    path,
    slug,
  }: {
    title: string
    authorSlug: string,
    content: string,
    dateCreated: number,
    dateLastModified: number,
    path: string,
    slug: string,
  }) {
    this.title = title;
    this.authorSlug = authorSlug;
    this.content = content;
    this.dateCreated = dateCreated;
    this.dateLastModified = dateLastModified;
    this.path = path;
    this.slug = slug;
  }

  /** For creating a new blog */
  public static forPost({
    title,
    authorSlug,
    content,
    slug,
  }: {
    title: string
    authorSlug: string,
    content: string,
    slug: string,
  }): BlogPostView {
    const encodedTitle = encodeURIComponent(title);
    const path = `/${slug}/${encodedTitle}`;
    const dateCreated = Date.now();
    const dateLastModified = dateCreated;
    const model = new BlogPostModel({
      title,
      authorSlug,
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
    authorSlug,
    content,
    dateCreated,
    dateLastModified,
    path,
    slug,
  }: {
    title: string
    authorSlug: string,
    content: string,
    dateCreated: number,
    dateLastModified: number,
    path: string,
    slug: string,
  }): BlogPostView {
    const model = new BlogPostModel({
      title,
      authorSlug,
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
      authorSlug: '[deleted]',
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
    curView,
  }: {
    title: string
    content: string,
    curView: BlogPostView
  }): BlogPostView {
    const model = new BlogPostModel({
      title,
      content,
      authorSlug: curView.authorSlug,
      dateCreated: curView.dateCreated,
      dateLastModified: Date.now(),
      path: curView.path,
      slug: curView.slug,
    });

    return model;
  }
}
