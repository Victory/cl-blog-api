# cl-blog-api
Blog REST API that supports threaded comments, written in Typescript to be run on NodeJS.


## Compiling & Running the server

Make sure both `git` and `curl` are installed.

May aslo help to use [nvm](https://github.com/nvm-sh/nvm) for easy `node` versioning.

e.g. by running following command in a terminal and then restaring the terminal

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```


Then we run the following
```
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

The build directory is located in `dist/`
To build
```sh
npm run build
```

To run
```sh
node dist/src/app.js
```
