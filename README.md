# SafeStake

## What is it?

A decentralised application on the Ethereum blockchain allowing investors to stake poker 
players for a share of the winnings.

A trustless alternative to forum-based staking, SafeStake uses escrow smart contracts to 
eliminate the trust-based risk taken on by an investor when staking a poker player.

## Usage Requirements

In its current state, SafeStake requires users wanting to make use of its staking features
to have the [Metamask](https://metamask.io/) browser extension available on their browser.

## To run SafeStake locally:

### Requirements

1. [Ganache](https://www.trufflesuite.com/ganache)
2. [Metamask](https://metamask.io/)
3. **truffle** - `npm install -g truffle`

### Steps

1. Launch local Ganache blockchain
2. `npm install` in top-level directory
3. `truffle compile && truffle migrate` in top-level directory to compile and deploy the smart contracts to the 
   local blockchain
4. `cd client && npm start` to start the local web server
5. Add a new network to Metamask - select "Custom RPC" from the networks dropdown, set the URL to `http://127.0.0.1:7545/` and the chain ID to `1337` (the Ganache defaults)
6. Import an account listed in the Ganache workspace into metamask by copying over the private key.
7. Connect to the site!