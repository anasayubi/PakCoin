# PakCoin
A light web bitcoin wallet customized for Pakistan-based users. Made with love with Node.js and the [Coinbase API](https://github.com/coinbase/coinbase-node).  
At the current moment only the manual method of installation is available.

## Manual Installation
You must have Node and MongoDB installed to run PakCoin. Clone the source code into the a directory and `cd` into it. (Note: the web app has only been tested with Node v6.10 and MongoDB v3.4)
### Linux
It is recommended that [NVM](https://github.com/creationix/nvm) is used when installing Node. This will ensure that Node v6.10 is used when running the web server. From the root of the project run:
1. `nvm install 6.10`
2. `nvm use`

Otherwise simply install from [nodejs.org](https://nodejs.org/en/download/).  
To run **PakCoin** follow these instructions:
1. Make a [coinbase](https://www.coinbase.com/?locale=en) account and note down API key and API secret key
2. Open the `coinbase.js` from root of project and store API key and API secret key as string values
3. Run `npm install` in project root
4. Start MongoDB with `sudo service mongod start`
5. Run the web server with `npm start`

Congratulations! Your web app is now running at `localhost:3000`. To access PakCoin open your browser to the URL   [`http://localhost:3000/`](http://localhost:3000/)

### Windows

## URLs
### `GET`
* `/` - index page **or** user wallet page if in session **or** admin page if in session
* `/signup` - opens signup page for a user
* `/login` - opens login page for a user
* `/logout` - logs out a current session
### `POST`
* `/signup` - attempt to log in as an existing user
* `/login` - attempt to sign up a new user
