# README

[Next.js](https://nextjs.org/) application using [Veramo](https://veramo.io/) libraries for SSI. It can create and manage DIDs with their associated DID documents and keys. It can also manage verifiable credentials. Although not implemented in the GUI, it also supports generating/validating verifiable presentations.

DIDs are resolved using the `ethr` method on the Ethereum `sepolia`. Conmnection to Ethereum is made using [Infura](https://app.infura.io/) provider and thus requires an Infura Project Id.

The Veramo agent has been modified to support managing a store of verifiable credentials. It should have been done defining a Veramo plugin, but due to a lack of time, is currently just a new method added to the veramo-agent object when created. All the Veramo configuration can be found in `lib/veramo`.

The application is using an encrypted (AES-256-GCM) Local Storage with a key derived from a user password using PBKDF2, although you could directly use a cryptographic key (check `/lib/encrypted-local-storage`).

## Test it

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
