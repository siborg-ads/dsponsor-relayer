# DSponsor Relayer

## Relayer App

The Relayer App serves several API endpoints and UI components within the [DSponsor ecosystem](https://dsponsor.com). It parses and transforms onchain data indexed by the [DSponsor subgraph (deployed within The Graph Network)](https://github.com/dcast-media/dsponsor-subgraph).

### API endpoints

API base URL: **`https://relayer.dsponsor.com/api/[chainId]`**

#### Ad spaces data for an offer

Purpose: Provide data to display on sponsors' interfaces

|Method|Endpoint|Parameters|
|--|--|--|
|`GET` or `POST`|`/ads/[offerId]`| `tokenIds` (optionnal) or `tokenData` (optionnal)|

<details>

<summary>
 Example
</summary>

##### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/ads/1?tokenData=web3,twitter,staking'
```

##### Response

```json
{
    "65329693524297118063646238334159138948524025175806621014596919199733788562630": {
        "imageURL-6.4:1": {
            "state": "CURRENT_ACCEPTED",
            "data": "https://6f375d41f2a33f1f08f6042a65d49ec9.ipfscdn.io/ipfs/bafybeihkthq6hnez2tfogymwnktkgnpbpbvreizpclhvzywyxkc6ukqa7u/"
        },
        "linkURL": {
            "state": "CURRENT_ACCEPTED",
            "data": "https://test.fr"
        },
        "tokenData": "web3",
        "_buy": {
            "mint": null,
            "secondary": null
        },
        "xCreatorHandle": {
            "state": "UNAVAILABLE",
            "data": null
        },
        "xSpaceId": {
            "state": "UNAVAILABLE",
            "data": null
        }
    },
    "101661046026135114031620108954831493212219976668510473490175828180454937635060": {
        "_buy": {
            "mint": null,
            "secondary": null
        },
        "imageURL-6.4:1": {
            "state": "UNAVAILABLE",
            "data": "https://relayer.dsponsor.com/reserved.webp"
        },
        "linkURL": {
            "state": "UNAVAILABLE",
            "data": "https://app.staging.dsponsor.com/sepolia/offer/1/101661046026135114031620108954831493212219976668510473490175828180454937635060"
        },
        "xCreatorHandle": {
            "state": "UNAVAILABLE",
            "data": null
        },
        "xSpaceId": {
            "state": "UNAVAILABLE",
            "data": null
        }
    },
    "64873369441774726751632143071124460964591437972899336413549633584093280026386": {
        "tokenData": "staking",
        "_buy": {
            "mint": null,
            "secondary": {
                "listingType": "Auction",
                "startTime": "1713975960",
                "endTime": "1717863960",
                "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
                "buyoutPricePerToken": "10000000000",
                "reservePricePerToken": "2500000",
                "status": "CREATED",
                "bids": []
            }
        },
        "imageURL-6.4:1": {
            "state": "BUY_MARKET",
            "data": "https://relayer.dsponsor.com/available.webp"
        },
        "linkURL": {
            "state": "BUY_MARKET",
            "data": "https://app.staging.dsponsor.com/sepolia/offer/1/64873369441774726751632143071124460964591437972899336413549633584093280026386"
        },
        "xCreatorHandle": {
            "state": "BUY_MARKET",
            "data": null
        },
        "xSpaceId": {
            "state": "BUY_MARKET",
            "data": null
        }
    },
    "_tokenIds": [
        "65329693524297118063646238334159138948524025175806621014596919199733788562630",
        "101661046026135114031620108954831493212219976668510473490175828180454937635060",
        "64873369441774726751632143071124460964591437972899336413549633584093280026386"
    ],
    "_tokenData": [
        "web3",
        "twitter",
        "staking"
    ]
}
```

</details>

#### Graph proxy

Purpose: Relay any GraphQL request to DSponsor subgraph, populate offer and token metadata

|Method|Endpoint|Parameters|
|--|--|--|
|`GET` or `POST`|`/graph`| `query` (required), `variables` (required)|

<details>

<summary>
 Example
</summary>

##### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/graph' \
  --data-raw '{"query":"query OfferRequest($offerId: String) {\n  adOffers(where: {id: $offerId} ) {\n    id\n    metadataURL\n    adParameters(where: { enable: true }) {      \n      adParameter {\n        id\n        base\n        variants\n      }\n    }\n    nftContract {\n      tokens {\n        mint {\n          tokenData\n        }\n      }\n    }\n  }\n}","variables":{"offerId":"1"},"operationName":"OfferRequest"}'
```

##### Response

```json
{
    "data": {
        "adOffers": [
            {
                "id": "1",
                "metadataURL": "...",
                "metadata": { ... }
        ]           
    }
}
```

</details>

#### Token metadata

Purpose: Returns token metadata following official ERC721 metadata standard

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/tokenMetadata/[nftcontract]/[tokenId]`||

<details>

<summary>
 Example
</summary>

##### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/tokenMetadata/0x6b9e4504a91b077d2b72b5186373ead75c6cdc03/2'
```

##### Response

```json
{
  "name": "Tokenmetadata name",
  "description": "Description",
  "image": "https://6f375d41f2a33f1f08f6042a65d49ec9.ipfscdn.io/ipfs/bafybeiffjiyl3sjjavmyrmawl6huvuwjxtddef7kn3fqlyabeh72gkchzy/"
}
```

</details>

### Integrations

App base URL: **`https://relayer.dsponsor.com/[chainId]`**

#### Clickable Logs Grid

##### Iframe

Use for: Web

<details>

<summary>
Example

</summary>

```
 <iframe src="https://relayer.dsponsor.com/11155111/iframe/10?bgColor=0d102d" height="100%" width="100%" />
```

</details>

##### HTML table

Use for: newsletters, GitHub READMEs

<details>

<summary>
Example
</summary>

###### HTML code

```html

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/0/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/0/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/1/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/1/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/2/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/2/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/3/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/3/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/4/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/4/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/5/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/5/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/6/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/6/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/7/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/7/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/8/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/8/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/9/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/9/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
</table>

```

###### Result

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/0/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/0/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/1/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/1/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/2/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/2/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/3/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/3/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/4/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/4/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/5/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/5/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/6/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/6/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/7/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/7/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/8/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/8/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ads/3/9/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/ads/3/9/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
</table>

</details>

### Development setup

```bash
cd www
npm i # install node dependencies
npm run dev # run next app locally
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
