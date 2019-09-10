<div align="center">
	<img src="media/logo.png" width="125" height="125">
	<h1>HD Wallet Scanner</h1>
	<p>
		<b>Find all used addresses in your Bitcoin HD Wallets bypassing gap limits</b>
	</p>
	<br>
</div>

HD Wallet Scanner is a utility for resolving [Account Discovery](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery) issue when HD Wallet has more than X (usually 20) unused addresses in a row and a wallet software stops seeing addresses beyond this point.

The utility was made to supplement [One-Time Address](https://github.com/alexk111/One-Time-Address). However it will also be helpful if you encounter the gap limit issue in other circumstances.

## How it works

1. You set an extended public key, a range for address indexes and a starting block for each of your HD Wallet
2. HD Wallet Scanner scans blocks and generates report files with address indexes and input stats in ```output``` directory
3. You use Bitcoin Core + HWI (if you use a hardware wallet) to import child keys derived with the address indexes and then spend unspent outputs

## Prerequisites

To run the application, you will need a synced Bitcoin full node with RPC enabled.

## Installing

```
# clone repo
git clone https://github.com/alexk111/HD-Wallet-Scanner

# navigate to it
cd HD-Wallet-Scanner

# install dependencies
yarn install

# add env variables
cp .env.sample .env

# add wallets config
cp wallets.js.sample wallets.js
```

Edit ```.env```:

- BITCOIND_RPCUSER and BITCOIND_RPCPASSWORD - user/pass to access Bitcoin RPC server
- MAX_ADDRESSES_PER_ITERATION - max number of addresses per a scan iteration (default: 100000)

Edit ```wallets.js```:

- Enter settings for your wallets

## Scanning

```
# running the scanner
yarn start
```

## Using Address Indexes

After the scan completes, you will get two files in ```output``` directory: ```IDS ids{i}-{j} hgt{m}-{n}.json``` and ```INS ids{i}-{j} hgt{m}-{n}.json```. The ```IDS ...``` file only contains the address indexes, whereas the ```INS ...``` file also contains an address, value of a transaction input and a height of a block the transaction is recorded in.

To derive child keys with the collected address indexes and import them into Bitcoin Core wallet use [HWI](https://github.com/bitcoin-core/HWI) if your private keys are stored on a hardware wallet and ```bitcoin-cli```'s [importmulti](https://bitcoin.org/en/developer-reference#importmulti). For more info on how to use Bitcoin Core with HWI check [this guide](https://github.com/bitcoin-core/HWI/blob/master/docs/bitcoin-core-usage.md).

 Note. If you have huge gaps between used addresses, then call ```importmulti``` with keypool range parameter equal to ```n,n``` where ```n``` is an address index, to add only that specific address.

## 💝 Donations are always appreciated!

Donate Bitcoin: https://donate.alexkaul.com/hd-wallet-scanner

## License

MIT © Alex Kaul


