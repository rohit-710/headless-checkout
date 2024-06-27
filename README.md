This is a demo of a headless NFT Checkout on multiple EVM chains such as Ethereum, Optimism, Base, Zora, etc. This demo showcases how you can enable cross-chain crypto payments with cross-chain ETH and use memecoins on Base such as $BRETT, $DEGEN, $TOSHI, etc to purchase NFTs on the mentioned chains above. 

The `checkout.tsx` makes API requests to `/orders`, which then makes the API calls to the Crossmint API. This is required because the update and get order APIs only function with a server-side API key. It is possible to create orders with a client-side key, but this demo simply uses the same server-side key for all calls to Crossmint.

See how to setup rainbowkit and related packages in `app/page.tsx`. You will also need to set up WalletConnect and obtain a projectId. 

You'll also need to copy the `env.sample` to `.env.local` and set your variables.

```
NEXT_PUBLIC_CROSSMINT_COLLECTION_ID=
NEXT_PUBLIC_WALLET_CONNECT_ID=
CROSSMINT_API_KEY=
CROSSMINT_API_URL=https://staging.crossmint.com/api/2024-01-01
```

Refer to https://docs.crossmint.com/nft-checkout/headless/overview for more info!
API Reference: https://docs.crossmint.com/api-reference/headless
