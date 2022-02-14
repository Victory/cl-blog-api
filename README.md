# cl-blog-api
Blog REST API that supports nested comments, written in Typescript to be run on NodeJS.

## Compiling & Running the server

Make sure both `git` and `curl` are installed.

May aslo help to use [nvm](https://github.com/nvm-sh/nvm) for easy `node` versioning.

e.g. by running following command in a terminal and then restaring the terminal

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```


Then we run the following perhaps by copy and pasting into a new terminal
```sh
git --version                                           # verify git is installed
nvm --version                                           # verify that nvm is installed at 0.39.1
nvm install 14.15.5                                     # install node version 14.15.5
nvm use 14.15.5                                         # set node version to 14.15.5
node --version                                          # verify node version 0.39.1
npm --version                                           # verify npm version 6.14.11
npx --version                                           # verify npx version 6.14.11
git clone https://github.com/Victory/cl-blog-api.git    # clone this repo
cd cl-blog-api                                          # chage directory into the repo
npm ci                                                  # get dependencies
```

### Building, Testing and Running

Tests are run against a "dev" server via a mocha/chai.
To run.

To test
```sh
npm run test
```

Which should give something like
```
Starting server
  CL Blog API
     App listening on http://localhost:7777 !
    ✔ Server is started (1096ms)
    ✔ Server is running version 1.0
    ✔ Gets bearer token for correct password. POST: http://localhost:7777/login (48ms)
    ✔ Does not get bearer token for username with illegal chars: http://localhost:7777/login
    ✔ Does not get bearer token for incorrect password and status code is set to 401. POST: http://localhost:7777/login
    ✔ Can logout user GET: http://localhost:7777/logout (88ms)
    ✔ POST a blog as a logged in user: http://localhost:7777/blog (153ms)
    ✔ Get all blogs: http://localhost:7777/blogs
    ✔ Get a single blog: http://localhost:7777/blogs (46ms)
    ✔ Can update a blog: PUT http://localhost:7777/blogs (246ms)
    ✔ Sanatizes HTML from title and body blog: POST/PUT http://localhost:7777/blogs (264ms)
    ✔ Delete a blog as a logged in user DELETE: http://localhost:7777/blog (294ms)
    ✔ Get top level comments (56ms)
    ✔ Get nested comments (71ms)
    ✔ Post a comment (289ms)
    ✔ Delete a comment (284ms)
Shutting down app gracefully.

```

The build directory is located in `dist/`.

To build
```sh
npm run build
```

To run
```sh
node dist/src/app.js
```

### Example usage
Note that sample data is generated on first load.

This will generate a few users `Alice`, `Bob`, `Eve` and `Scott`.

A user's password is there name followed by `123`, for example Alice's password
is `Alice123`.

```sh
curl http://localhost:8080  # verify the server is running
```

Should return somethign like `{"apiVersion":"1.0"}`;

Get a list of blogs
```sh
 curl http://localhost:8080/blogs
```

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{ "userName": "Alice", "password": "Alice123" }' \
  http://localhost:8080/login
```

Should return something like `{"bearerToken":"17ef7dc942882c0839"}`

Make note of the value of the bearer token, you will need this is how you make
requests to the api which require authorization

Post a new blog. **NOTE you must change the value of bearer token** to your
token from the call to `/login` above.

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 17ef7dc942882c0839" \
  -d '{ "title": "My New Blog", "content": "<p>Its fun to blog everyday</p>" }' \
  http://localhost:8080/blog
```

Which will return something like following (Note that HTML tags are stripped)
```json
{
    "title": "My New Blog",
    "authorName": "Alice",
    "content": "Its fun to blog everyday",
    "dateCreated": 1644836199639,
    "dateLastModified": 1644836199639,
    "path": "/17ef7e09cd72c5ab353/My%20New%20Blog",
    "slug": "17ef7e09cd72c5ab353"
}
```

Make note of the `slug` this how you reference this CRUD operations

To post a new comment
```sh
curl -X POST \
  -H "Content-Type: application/json"  \
  -H "Authorization: Bearer 17ef7dc942882c0839"  \
  -d '{ "content": "Insightful blog, thanks for posting!" }' \
  http://localhost:8080/comments/17ef7e09cd72c5ab353 
```

And then you can get the comments of a blog with slug `17ef7e09cd72c5ab353`

```sh
curl http://localhost:8080/comments/17ef7e09cd72c5ab353
```
A comment may look like

```json
{
  "authorName": "Scott",
  "content": "I will reply to Nice post about How to fish in the sea",
  "slug": "17ef7eb50eb265bcf89",
  "blogSlug": "17ef7eb50d0bf53d1d",
  "parentSlug": "17ef7eb50e82262d388",
  "globalIndex": 2,
  "dateCreated": 1644836901099,
  "hasChildren": true,
}
```

The `blogSlug` is the blog this comment is replying to. `hasChildren` is true if
this blog post has children. `globalIndex` is used for pagination via a "load
more" pattern, i.e. load all comments to this blog with `globalIndex > 2`. 

Or soft delete a comment with slug `17ef7e5869f11707bd0`

```sh
curl -X DELETE \
  -H "Authorization: Bearer 17ef7dc942882c0839" \
  http://localhost:8080/comment/17ef7e5869f11707bd0
```

The list of endpoints are

```sh
GET      /  # get api version

POST    /login   # get bearer token '{ "userName": string, "password": string }'
GET     /logout  # invalidate bearer token

GET     /blogs  # get all blogs

POST    /blog            # create a new blog  '{ "title": string, "content": string }`
GET     /blog/:blogSlug  # get blog with given slug
PUT     /blog/:blogSlug  # update blog with given slug
DELETE  /blog/:blogSlug  # delete a blog

GET     /comments/:blogSlug              # get all top level comments for a given blog
GET     /comments/:blogSlug/:parentSlug  # get all child comments for comment in a blog
POST    /comments/:blogSlug              # post a new top level comment
POST    /comments/:blogSlug/:parentSlug  # reply to a comment in a blog
DELETE  /comment/:commentSlug            # delete a comment
```

All data should be sent a `Content-type: application/json`. There beare token is
returned by `/login` and should be sent to endpoints via a header
`Authorization: Bearer $TOKEN`.
