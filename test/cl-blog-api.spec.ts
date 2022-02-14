/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Server } from 'http';
import fetch from 'cross-fetch';
import CSLogger from '../src/CSLogger';
import startServer from '../src/startServer';
import initData from '../src/initData';
import BlogPostView from '../src/model/blogs/BlogPostView';
import CommentModel from '../src/model/comments/CommentModel';

const port = 7777;
const baseUrl = `http://localhost:${port}`;
let server: Server | null = null;

try {
  CSLogger.log('Starting server');

  describe('CL Blog API', () => {
    const loginUrl = `${baseUrl}/login`;
    const logoutUrl = `${baseUrl}/logout`;
    const blogUrl = `${baseUrl}/blog`;
    const blogsUrl = `${baseUrl}/blogs`;

    const commentsUrl = `${baseUrl}/comments`;
    const commentUrl = `${baseUrl}/comment`;

    // start the server
    it('Server is started', async () => {
      server = startServer(port);
      await initData();
      await new Promise((res) => {
        setTimeout(() => { res(null); }, 1000);
      });
      const resp = await fetch(baseUrl);
      const json = await resp.json();
      expect(json).is.not.empty;
    });

    it('Server is running version 1.0', async () => {
      const resp = await fetch(baseUrl);
      const json = await resp.json();
      expect(json.apiVersion).equal('1.0');
    });

    it(`Gets bearer token for correct password. POST: ${loginUrl}`, async () => {
      const body = JSON.stringify({
        userName: 'Alice',
        password: 'Alice123',
      });
      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body,
      });

      expect(resp.status).equals(200);
      const json = await resp.json();
      expect(json.bearerToken).not.to.be.empty;
    });

    it(`Does not get bearer token for username with illegal chars: ${loginUrl}`, async () => {
      const body = JSON.stringify({
        userName: '$*$*$*$',
        password: 'wrong-password',
      });

      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body,
      });

      expect(resp.status).equals(401);
      const json = await resp.json();
      expect(json.bearerToken).to.be.empty;
    });

    it(`Does not get bearer token for incorrect password and status code is set to 401. POST: ${loginUrl}`, async () => {
      const body = JSON.stringify({
        userName: 'Alice',
        password: 'wrong-password',
      });

      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body,
      });

      expect(resp.status).equals(401);
      const json = await resp.json();
      expect(json.bearerToken).to.be.empty;
    });

    it(`Can logout user GET: ${logoutUrl}`, async () => {
      const loginBody = JSON.stringify({
        userName: 'Alice',
        password: 'Alice123',
      });

      let resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: loginBody,
      });

      expect(resp.status).equals(200);
      let json = await resp.json();
      expect(json.bearerToken).not.to.be.empty;

      resp = await fetch(logoutUrl, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${json.bearerToken}`,
        },
      });

      expect(resp.status).equals(200);
      json = await resp.json();
      expect(json.bearerToken).to.be.empty;
    });

    it(`POST a blog as a logged in user: ${blogUrl}`, async () => {
      const loginBody = JSON.stringify({
        userName: 'Bob',
        password: 'Bob123',
      });

      let resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: loginBody,
      });

      const json = await resp.json();

      const blogPostBody = JSON.stringify({
        content: 'my content',
        title: 'my title',
      });
      resp = await fetch(blogUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${json.bearerToken}`,
        },
        body: blogPostBody,
      });

      const respBody = await resp.json() as BlogPostView;
      expect(respBody.title).equals('my title');
      expect(respBody.content).equals('my content');
      expect(resp.status).eqls(201);
    });

    it(`Get all blogs: ${blogsUrl}`, async () => {
      const allBlogsResponse = await fetch(blogsUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(allBlogsResponse.status).equals(200);
      const allBlogs = await allBlogsResponse.json() as BlogPostView[];
      expect(allBlogs).length.greaterThan(2);
    });

    it(`Get a single blog: ${blogsUrl}`, async () => {
      const allBlogsResponse = await fetch(blogsUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(allBlogsResponse.status).equals(200);
      const allBlogs = await allBlogsResponse.json() as BlogPostView[];
      expect(allBlogs).length.greaterThan(2);

      const targetBlog = allBlogs[0];
      const aBlogUrl = `${blogUrl}/${targetBlog.slug}`;
      const aBlogResponse = await fetch(aBlogUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(aBlogResponse.status).equals(200);
      const foundBlog = await aBlogResponse.json() as BlogPostView;
      expect(foundBlog.title).equal(targetBlog.title);
      expect(foundBlog.authorName).equal(targetBlog.authorName);
    });

    it(`Can update a blog: PUT ${blogsUrl}`, async () => {
      const loginBody = JSON.stringify({
        userName: 'Bob',
        password: 'Bob123',
      });

      let resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: loginBody,
      });

      const json = await resp.json();

      const blogPostBody = JSON.stringify({
        content: 'my content',
        title: 'my title',
      });
      resp = await fetch(blogUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${json.bearerToken}`,
        },
        body: blogPostBody,
      });

      const originalBlog = await resp.json() as BlogPostView;
      expect(originalBlog.title).equals('my title');
      expect(originalBlog.content).equals('my content');
      expect(resp.status).eqls(201);

      const blogEditBody = JSON.stringify({
        title: 'new title',
        content: 'new content',
      });

      resp = await fetch(`${blogUrl}/${originalBlog.slug}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${json.bearerToken}`,
        },
        body: blogEditBody,
      });

      resp = await fetch(`${blogUrl}/${originalBlog.slug}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });

      const newBlog = await resp.json() as BlogPostView;
      expect(newBlog.title).equals('new title');
      expect(newBlog.content).equals('new content');
      expect(resp.status).eqls(200);
    });

    it(`Sanatizes HTML from title and body blog: POST/PUT ${blogsUrl}`, async () => {
      const loginBody = JSON.stringify({
        userName: 'Bob',
        password: 'Bob123',
      });

      let resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: loginBody,
      });

      const json = await resp.json();

      const blogPostBody = JSON.stringify({
        content: '<h3>my content</h3>',
        title: '<span>my title</span>',
      });
      resp = await fetch(blogUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${json.bearerToken}`,
        },
        body: blogPostBody,
      });

      const originalBlog = await resp.json() as BlogPostView;
      expect(originalBlog.title).equals('my title');
      expect(originalBlog.content).equals('my content');
      expect(resp.status).eqls(201);

      const blogEditBody = JSON.stringify({
        title: '<h1>new title</h1>',
        content: '<p>new content</p>',
      });

      resp = await fetch(`${blogUrl}/${originalBlog.slug}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${json.bearerToken}`,
        },
        body: blogEditBody,
      });

      resp = await fetch(`${blogUrl}/${originalBlog.slug}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });

      const newBlog = await resp.json() as BlogPostView;
      expect(newBlog.title).equals('new title');
      expect(newBlog.content).equals('new content');
      expect(resp.status).eqls(200);
    });

    it(`Delete a blog as a logged in user DELETE: ${blogUrl}`, async () => {
      const loginBody = JSON.stringify({
        userName: 'Bob',
        password: 'Bob123',
      });

      let resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: loginBody,
      });
      const login = await resp.json();

      const blogPostBody = JSON.stringify({
        content: 'my content',
        title: 'my title',
      });
      resp = await fetch(blogUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${login.bearerToken}`,
        },
        body: blogPostBody,
      });

      const originalBlog = await resp.json() as BlogPostView;
      expect(originalBlog.title).equals('my title');
      expect(originalBlog.content).equals('my content');
      expect(resp.status).eqls(201);

      resp = await fetch(`${blogUrl}/${originalBlog.slug}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });

      const newBlog = await resp.json() as BlogPostView;
      expect(newBlog.title).equals('my title');
      expect(newBlog.content).equals('my content');

      resp = await fetch(`${blogUrl}/${originalBlog.slug}`, {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${login.bearerToken}`,
        },
      });

      resp = await fetch(`${blogUrl}/${originalBlog.slug}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });

      const deletedBLog = await resp.json() as BlogPostView;
      expect(resp.status).equals(404);
      expect(deletedBLog.title).equals('[deleted]');
      expect(deletedBLog.content).equals('[deleted]');
      expect(deletedBLog.authorName).equals('[deleted]');
    });

    it('Get top level comments', async () => {
      const allBlogsResponse = await fetch(blogsUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(allBlogsResponse.status).equals(200);
      const allBlogs = await allBlogsResponse.json() as BlogPostView[];
      expect(allBlogs).length.greaterThanOrEqual(3);

      const firstBlogSlug = allBlogs[0].slug;
      const allCommentsUrl = `${commentsUrl}/${firstBlogSlug}`;
      const opCommentsResponse = await fetch(allCommentsUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });

      const opComments = await opCommentsResponse.json() as CommentModel[];
      // note that comments are filled in `initData`
      expect(opComments).length.greaterThanOrEqual(2);
    });

    it('Get nested comments', async () => {
      const allBlogsResponse = await fetch(blogsUrl, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(allBlogsResponse.status).equals(200);
      const allBlogs = await allBlogsResponse.json() as BlogPostView[];
      expect(allBlogs).length.greaterThanOrEqual(3);

      const firstBlogSlug = allBlogs[0].slug;
      const allCommentsUrl = `${commentsUrl}/${firstBlogSlug}`;
      const opCommentsResponse = await fetch(allCommentsUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });

      const opComments = await opCommentsResponse.json() as CommentModel[];
      // note that comments are filled in `initData`
      expect(opComments).length.greaterThanOrEqual(2);

      const commentWithChild = opComments.find((c) => c.hasChildren) as CommentModel;
      expect(!!commentWithChild).to.be.true;

      const childCommentUrl = `${commentsUrl}/${firstBlogSlug}/${commentWithChild.slug}`;
      const childCommentsResponse = await fetch(childCommentUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });
      const childComments = await childCommentsResponse.json() as CommentModel[];
      // note that comments are filled in `initData`
      expect(childComments).length.greaterThan(0);
    });

    it('Post a comments', async () => {
      const loginBody = JSON.stringify({
        userName: 'Bob',
        password: 'Bob123',
      });

      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: loginBody,

      });
      const login = await resp.json();

      const allBlogsResponse = await fetch(blogsUrl, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });
      expect(allBlogsResponse.status).equals(200);
      const allBlogs = await allBlogsResponse.json() as BlogPostView[];
      expect(allBlogs).length.greaterThan(2);

      const targetBlog = allBlogs.find((blog) => blog.title !== '[deleted]');

      const postCommentUrl = `${commentsUrl}/${targetBlog.slug}`;
      const firstPostBody = JSON.stringify({
        content: 'my first comment',
      });
      const postFirstCommentResponse = await fetch(postCommentUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${login.bearerToken}`,
        },
        body: firstPostBody,
      });
      const firstComment = await postFirstCommentResponse.json() as CommentModel;
      expect(firstComment.content).equals('my first comment');

      const replyCommentUrl = `${commentsUrl}/${targetBlog.slug}/${firstComment.slug}`;
      const replyBody = JSON.stringify({
        content: 'my reply',
      });
      const replyResponse = await fetch(replyCommentUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${login.bearerToken}`,
        },
        body: replyBody,
      });
      const replyCommentView = await replyResponse.json() as CommentModel;
      expect(replyCommentView.content).equals('my reply');
    });

    it('Delete a comments', async () => {
      const loginBody = JSON.stringify({
        userName: 'Bob',
        password: 'Bob123',
      });

      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: loginBody,
      });
      const login = await resp.json();

      const allBlogsResponse = await fetch(blogsUrl, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${login.bearerToken}`,
        },
      });
      expect(allBlogsResponse.status).equals(200);
      const allBlogs = await allBlogsResponse.json() as BlogPostView[];
      expect(allBlogs).length.greaterThan(2);

      const targetBlog = allBlogs.find((blog) => blog.title !== '[deleted]');

      const postCommentUrl = `${commentsUrl}/${targetBlog.slug}`;
      const firstPostBody = JSON.stringify({
        content: 'my first comment',
      });
      const postFirstCommentResponse = await fetch(postCommentUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${login.bearerToken}`,
        },
        body: firstPostBody,
      });
      const firstComment = await postFirstCommentResponse.json() as CommentModel;
      expect(firstComment.content).equals('my first comment');

      const deleteCommentUrl = `${commentUrl}/${firstComment.slug}`;
      const deleteCommentResponse = await fetch(deleteCommentUrl, {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${login.bearerToken}`,
        },
      });
      expect(deleteCommentResponse.status).equals(200);

      const allCommentsUrl = `${commentsUrl}/${targetBlog.slug}`;
      const opCommentsResponse = await fetch(allCommentsUrl, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });

      const commentsJson = await opCommentsResponse.json() as CommentModel[];
      const found = commentsJson.find((c) => c.slug === firstComment.slug) as CommentModel;
      expect(found).to.not.be.empty;
      expect(found.content).equals('[deleted]');
    });

    // close the server
    after(() => {
      CSLogger.log('Shutting down app gracefully.');
      server.close();
    });
  });
} finally {
  // close the server if needed (e.g. after didn't run)
  if (server) {
    CSLogger.log('Shutting down app on exception.');
    server.close();
  }
}
