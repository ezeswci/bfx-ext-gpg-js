# bfx-ext-gpg-js

Service to sign files by PGP signature

## Setup

### Dependencies

- Install the [Grenache Grape](https://github.com/bitfinexcom/grenache-grape) globally and run two `Grapes`:

```console
npm i -g grenache-grape
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

- Install the [MongoDB](https://docs.mongodb.com/manual/installation)

### Install

- Clone Github repository and install projects dependencies :

```console
git clone https://github.com/bitfinexcom/bfx-ext-gpg-js.git
cd bfx-ext-gpg-js
npm install
```

### Configure service

- As to configure the service copy the `*.json.example` files from config folder into new ones. Open a console on the projects folder and run the following commands:

```console
cp config/common.json.example config/common.json
cp config/gpg.ext.json.example config/gpg.ext.json
cp config/facs/db-mongo.config.json.example config/facs/db-mongo.config.json
cp config/facs/grc.config.json.example config/facs/grc.config.json
```

- Set service lookup key etc in `config/gpg.ext.json`:

```console
vim config/gpg.ext.json
```

- Set MongoDB parameters such as `host`, `port`, `user`, `password`, `database` in `config/facs/db-mongo.config.json`:

```console
vim config/facs/db-mongo.config.json
```

### Boot worker

- For the production environment execute the following command:

```console
npm start
```

- For the development environment execute the following command:

```console
npm run startDev
```

## Grenache API

### action: `getDigitalSignature`

The endpoint to sign the passing file by PGP signature

**Parameters**:

- `args`: &lt;Array&gt;

  - `0`: &lt;String | Buffer&gt; File to sign (Hex encoded buffer or Buffer)
  - `1`: &lt;Object&gt;

    - `userId`: &lt;Integer&gt; user id, storing into the DB
    - `name`: &lt;String&gt; (optional) user name, using for file signing
    - `email`: &lt;String&gt; (optional) user email, using for file signing

**Response**:

- PGP signature: &lt;String&gt;

**Example Response**:

```json
"-----BEGIN PGP SIGNATURE-----
Version: OpenPGP.js v4.5.2
Comment: https://openpgpjs.org

wl4EARYKAAYFAlzuSK8ACgkQjqyWFnGcaO3dzAEAh+9U92Ft8ti160vrRrvF
QpPMy9o5BO6uzwnFd3ZuCzUBALxVzcIsAu2mViCwDSVUqe3U4QDyhhZugU6y
SVei5CIE
=VThb
-----END PGP SIGNATURE-----"
```

### action: `verifyDigitalSignature`

The endpoint to verify the passing PGP signature and file or file hash

**Parameters**:

- `args`: &lt;Array&gt;

  - `0`: &lt;String | Buffer&gt; (optional) File to verify (Hex encoded buffer or Buffer)
  - `1`: &lt;Object&gt;

    - `signature`: &lt;String&gt; PGP signature of the file
    - `fileHash`: &lt;String&gt; (optional) `sha256` hash of the file

There is needed to pass one file argument, or `args[0]` or `fileHash`. If file arguments are both passed priority is given `fileHash`

**Response**:

- Validation result: &lt;Boolean&gt;

## Testing

- For running tests execute the following command:

```console
npm test
```
