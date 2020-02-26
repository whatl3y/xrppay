# xrppay

## What is xrppay?

xrppay is designed is to allow users to purchas products online using
their cyrptocurrency(ies) with a minimal amount of currency conversion,
conversion/withdrawal fees, and ultimately reduce headache(s). The idea is to simplify
using your cryptocurrency to buy goods & services without the current red
tape involved with converting your cryptocurrency into fiat and back again.

## Setup

The following steps are required to get this app up-and-running and begin allowing
users to create accounts and use their cryptocurrency to buy things online.

### Note on Testing vs. Production

The following steps can be used regardless of if you'd like to test the app using
the Privacy API sandbox and Ripple Testnet, or if you're ready to begin using xrppay
in production with both Privacy API production and Ripple Mainnet.

You should ensure the environment variables listed in the steps below
for your server are set appropriately and toggle environment variable
NODE_ENV from `development` to `production` depending on where you are with
testing vs. production readiness.

#### Steps to Configure Server

1. Create a [privacy.com](https://privacy.com/) account
    - You'll need an ISSUING account to support creating cards to be used by your users
    - Make sure you [Enable API](https://privacy.com/account#api-key)
    - Populate the following environment variable with your Privacy API key
        - PRIVACY_API_KEY
2. Create two new Ripple wallets (i.e. public/private key pair)
    - Create new address with `npm run generateXrpAddress`
        1. The first address will be the primary address that users will send XRP to and the app will manage wallets of users with
        2. The second address will be a cold address that the app will send XRP to when users spend money at merchants with their temp cards
    - Fund this account by sending at least 20 XRP to it from another address (either another private address or from an exchange)
    - Populate the following environment variables with the output from the script above
        - RIPPLE_X_ADDRESS
        - RIPPLE_CLASSIC_ADDR
        - RIPPLE_SECRET
        - RIPPLE_COLD_X_ADDRESS
        - RIPPLE_COLD_CLASSIC_ADDR

## Development

### Install

#### Manual (macOS)

1. Add entry to `/etc/hosts` to point to localhost for dev URL
    - `127.0.0.1       dev.xrppay.com`
2. Install [Homebrew](https://brew.sh/)
3. Install NodeJS via [nvm](https://github.com/nvm-sh/nvm)
    - `nvm install 12.15.0`
    - `nvm alias default 12.15.0`
4. Install PostgreSQL via [Postgres.app](https://postgresapp.com/)
    - Create DBs in `psql` or your client of choice
    - `CREATE DATABASE xrppay`
    - `CREATE DATABASE xrppay_test`
5. Install redis (`brew install redis`)
    - `brew services list` to make sure redis service is started without issues
6. Clone xrppay (`git clone https://github.com/whatl3y/xrppay`)
7. `cd xrppay`
8. `touch .env` and setup appropriate [Environment Variables](#Environment-Variables)
9. `npm install`
9. `npm run migrate`
10. `npm run dev`
11. In new terminal window/tab `cd [xrppay/]client`
12. `npm install`
13. `npm run serve`