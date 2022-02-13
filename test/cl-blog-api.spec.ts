/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Server } from 'http';
import fetch from 'cross-fetch';
import CSLogger from '../src/CSLogger';
import startServer from '../src/startServer';
import initData from '../src/initData';
import BlogPostView from '../src/model/blogs/BlogPostView';

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

    it(`POST a blog as a logged in user : ${blogUrl}`, async () => {
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
      expect(foundBlog.authorSlug).equal(targetBlog.authorSlug);
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
