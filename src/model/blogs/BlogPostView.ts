/** Represent a way to view a blog */
type BlogPostView = {
  /** blog title */
  title: string;
  /** Author's user slug of the blog */
  authorSlug: string;
  /** blog content */
  content: string;
  /** UTC timestamp `Date.now()` for when the post was created */
  dateCreated: number;
  /** UTC timestamp `Date.now()` for when the was last modified */
  dateLastModified: number;
  /** url slug */
  path: string;
  /** Globally unique part of the slug */
  slug: string;
};

export default BlogPostView;
