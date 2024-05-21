# DSponsor Relayer

## Relayer App

The Relayer App provides API endpoints and UI components for the [DSponsor ecosystem](https://dsponsor.com). It processes and transforms on-chain data indexed by the [DSponsor subgraph](https://github.com/dcast-media/dsponsor-subgraph) deployed on The Graph Network.

### Development setup

```bash
cd www
npm i # install node dependencies
npm run dev # run next app locally
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test.

### API endpoints

API base URL: `https://relayer.dsponsor.com/api/[chainId]`

#### Get a sponsor's ad spaces

Purpose: Retrieve tokens from DSponsor ad offers owned by a specific wallet.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/account/[userAddress]/tokens`| |

<details>

<summary>
 Example
</summary>

##### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/account/0x9a7FAC267228f536A8f250E65d7C4CA7d39De766/tokens'
```

##### Response

```json
[
  {
    "id": "1",
    "disable": false,
    "metadataURL": "https://bafkreicmn6gia3cplyt7tu56sfue6cpw5dm2dnwuz2zkj4dhqrg5bzwuua.ipfs.nftstorage.link/",
    "name": "Tokenized ad spaces in SiBorg App",
    "initialCreator": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766",
    "validators": null,
    "admins": [
      "0x9a7fac267228f536a8f250e65d7c4ca7d39de766"
    ],
    "creationTimestamp": "1713371172",
    "adParameters": [
      {
        "adParameter": {
          "id": "imageURL-6.4:1",
          "base": "imageURL",
          "variants": [
            "6.4:1"
          ]
        }
      },
      {
        "adParameter": {
          "id": "linkURL",
          "base": "linkURL",
          "variants": []
        }
      },
      {
        "adParameter": {
          "id": "xCreatorHandle",
          "base": "xCreatorHandle",
          "variants": []
        }
      },
      {
        "adParameter": {
          "id": "xSpaceId",
          "base": "xSpaceId",
          "variants": []
        }
      }
    ],
    "nftContract": {
      "id": "0x83476e4178394fd4ac6d958a6933247d3531dbd9",
      "allowList": false,
      "maxSupply": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "prices": [],
      "tokens": [
        {
          "tokenId": "110771216890900307486995680796878979552050216338441285842533727414245120540081",
          "setInAllowList": false,
          "marketplaceListings": [
            {
              "listingType": "Direct",
              "startTime": "1713630360",
              "endTime": "1714062360",
              "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
              "buyoutPricePerToken": "45500000",
              "reservePricePerToken": "45500000",
              "status": "CREATED",
              "bids": []
            }
          ],
          "nftContract": {
            "allowList": false,
            "prices": []
          },
          "mint": {
            "tokenData": "airdrop",
            "blockTimestamp": "1713371592"
          },
          "prices": [],
          "metadata": {
            "name": "#airdrop - Tokenized Ad Space",
            "description": "Tokenized advertisement spaces link to the ticker 'airdrop' (query term in the app)\n\nBuying this ad space give you the exclusive right to submit an ad to be displayed when any user searches for 'airdrop'.\nSiBorg team still has the power to validate or reject ad assets.\nYou are free to change the ad proposal at anytime and free to resell it on the open market.",
            "image": "https://placehold.co/400x400?text=SiBorg%20Ad%20Space%0Aairdrop",
            "external_url": "",
            "attributes": [
              {
                "trait_type": "Search Query",
                "value": "airdrop"
              }
            ]
          }
        }
      ]
    }
  }
]
```

</details>

#### Ad spaces data for an offer

Purpose: Retrieve data to display on sponsors' interfaces.

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
  "_tokenIds": [
    "65329693524297118063646238334159138948524025175806621014596919199733788562630",
    "101661046026135114031620108954831493212219976668510473490175828180454937635060",
    "64873369441774726751632143071124460964591437972899336413549633584093280026386",
    "42815755960540918129438353840082893508347041245824540425731235505437781612563"
  ],
  "_tokenData": [
    "web3",
    "twitter",
    "staking",
    "cryptonnews"
  ],
  "65329693524297118063646238334159138948524025175806621014596919199733788562630": {
    "imageURL-6.4:1": {
      "state": "CURRENT_ACCEPTED",
      "data": "https://6f375d41f2a33f1f08f6042a65d49ec9.ipfscdn.io/ipfs/bafybeihkthq6hnez2tfogymwnktkgnpbpbvreizpclhvzywyxkc6ukqa7u/"
    },
    "linkURL": {
      "state": "CURRENT_ACCEPTED",
      "data": "https://test.fr"
    },
    "_tokenData": "web3",
    "_buy": {
      "link": "https://app.staging.dsponsor.com/sepolia/offer/1/65329693524297118063646238334159138948524025175806621014596919199733788562630?tokenData=web3",
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
    "_tokenData": "twitter",
    "_buy": {
      "link": "https://app.staging.dsponsor.com/sepolia/offer/1/101661046026135114031620108954831493212219976668510473490175828180454937635060?tokenData=twitter",
      "mint": null,
      "secondary": null
    },
    "imageURL-6.4:1": {
      "state": "UNAVAILABLE",
      "data": "https://relayer.dsponsor.com/reserved.webp"
    },
    "linkURL": {
      "state": "UNAVAILABLE",
      "data": "https://app.staging.dsponsor.com/sepolia/offer/1/101661046026135114031620108954831493212219976668510473490175828180454937635060?tokenData=twitter"
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
    "_tokenData": "staking",
    "_buy": {
      "link": "https://app.staging.dsponsor.com/sepolia/offer/1/64873369441774726751632143071124460964591437972899336413549633584093280026386?tokenData=staking",
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
      "data": "https://app.staging.dsponsor.com/sepolia/offer/1/64873369441774726751632143071124460964591437972899336413549633584093280026386?tokenData=staking"
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
  "42815755960540918129438353840082893508347041245824540425731235505437781612563": {
    "_tokenData": "cryptonnews",
    "_buy": {
      "link": "https://app.staging.dsponsor.com/sepolia/offer/1/42815755960540918129438353840082893508347041245824540425731235505437781612563?tokenData=cryptonnews",
      "mint": null,
      "secondary": null
    },
    "imageURL-6.4:1": {
      "state": "UNAVAILABLE",
      "data": "https://relayer.dsponsor.com/reserved.webp"
    },
    "linkURL": {
      "state": "UNAVAILABLE",
      "data": "https://app.staging.dsponsor.com/sepolia/offer/1/42815755960540918129438353840082893508347041245824540425731235505437781612563?tokenData=cryptonnews"
    },
    "xCreatorHandle": {
      "state": "UNAVAILABLE",
      "data": null
    },
    "xSpaceId": {
      "state": "UNAVAILABLE",
      "data": null
    }
  }
}
```

</details>

#### Graph proxy

Purpose: Relay any GraphQL request to the DSponsor subgraph and populate offer and token metadata.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET` or `POST`|`/graph`| `query` (required), `variables` (required)|

You can use [Apollo's Sandbox](https://studio.apollographql.com/sandbox/explorer), with `https://relayer.dsponsor.com/api/11155111/graph` set as the endpoit.

<details>

<summary>
 Example
</summary>

##### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/graph' \
  --data-raw '{
    "query": "query OfferRequest($offerId: String) {
      adOffers(where: { id: $offerId }) {
        id
        metadataURL
        nftContract {
          tokens(first: 1) {
            tokenId
            mint {
              tokenData
            }
          }
        }
      }
    }",
    "variables": {
      "offerId": "1"
    },
    "operationName": "OfferRequest"
  }'

```

##### Response

```json
{
    "data": {
        "adOffers": [
            {
                "id": "1",
                "metadataURL": "https://bafkreicmn6gia3cplyt7tu56sfue6cpw5dm2dnwuz2zkj4dhqrg5bzwuua.ipfs.nftstorage.link/",
                "nftContract": {
                    "tokens": [
                        {
                            "tokenId": "109209750437790945652155443835624055978955232477308362696330723152483678880972",
                            "mint": {
                                "tokenData": "lol"
                            },
                            "metadata": {
                                "name": "#lol - Tokenized Ad Space",
                                "description": "Tokenized advertisement spaces link to the ticker 'lol' (query term in the app)\n\nBuying this ad space give you the exclusive right to submit an ad to be displayed when any user searches for 'lol'.\nSiBorg team still has the power to validate or reject ad assets.\nYou are free to change the ad proposal at anytime and free to resell it on the open market.",
                                "image": "https://placehold.co/400x400?text=SiBorg%20Ad%20Space%0Alol",
                                "external_url": "",
                                "attributes": [
                                    {
                                        "trait_type": "Search Query",
                                        "value": "lol"
                                    }
                                ]
                            }
                        }
                    ]
                },
                "metadata": {
                    "creator": {
                        "name": "SiBorg",
                        "description": "SiBorg application empowers podcasters by leveraging SocialFi.",
                        "image": "https://bafkreidonqrmvzm4544yv7lqeggp3t34r72glwszbh3qafjqmegvzvgiry.ipfs.nftstorage.link/",
                        "external_link": "https://siborg.io",
                        "categories": [
                            "dApp",
                            "social",
                            "media",
                            "education"
                        ]
                    },
                    "offer": {
                        "name": "Tokenized ad spaces in SiBorg App",
                        "description": "Tokenized advertisement spaces, each token is linked to a search term.\n\nBuying an ad space from the collection give you the exclusive right to submit an ad.\nSiBorg team still has the power to validate or reject ad assets. You are free to change the ad proposal at anytime and free to resell it on the open market.",
                        "image": "https://bafkreif4dihekhhd24itluilol4qab6zxhwlokkinbpnkqaprzf6jenqne.ipfs.nftstorage.link/",
                        "terms": "https://bafybeie554c4fryghl6ao7jobfoji5d2qist3rq2j6lmminslu7u46d6si.ipfs.nftstorage.link/",
                        "external_link": "",
                        "valid_from": "2024-05-01T00:00:00Z",
                        "valid_to": "2024-10-31T23:59:59Z",
                        "categories": [
                            "Community",
                            "NFT",
                            "Crypto"
                        ],
                        "token_metadata": {
                            "name": "#{tokenData} - Tokenized Ad Space",
                            "description": "Tokenized advertisement spaces link to the ticker '{tokenData}' (query term in the app)\n\nBuying this ad space give you the exclusive right to submit an ad to be displayed when any user searches for '{tokenData}'.\nSiBorg team still has the power to validate or reject ad assets.\nYou are free to change the ad proposal at anytime and free to resell it on the open market.",
                            "image": "https://placehold.co/400x400?text=SiBorg%20Ad%20Space%0A{tokenData}",
                            "external_url": "",
                            "attributes": [
                                {
                                    "trait_type": "Search Query",
                                    "value": "{tokenData}"
                                }
                            ]
                        }
                    }
                }
            }
        ]
    }
}
```

</details>

#### Price quotes

Purpose: Retrieve USD and ETH prices for a specific token from Uniswap.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/prices`|`token` (required), `amount` (required), `splippage` (required)|

<details>

<summary>
 Example (0.00002 UNI, 0.3% slippage)
</summary>

##### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/prices?token=0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984&amount=20000000000000&slippage=0.3'
```

##### Response

```json
{
  "amountInEth": "108438648604539",
  "amountInEthWithSlippage": "108763964550352",
  "amountUSDC": "236459484",
  "amountInEthFormatted": "0.000108438648604539",
  "amountInEthWithSlippageFormatted": "0.000108763964550352",
  "amountUSDCFormatted": "236.459484"
}
```

</details>

#### Token metadata

Purpose: Retrieve token metadata according to the official ERC721 metadata standard.

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
  "name": "ULtra Site 2",
  "description": "the best site",
  "image": "https://6f375d41f2a33f1f08f6042a65d49ec9.ipfscdn.io/ipfs/bafybeiffjiyl3sjjavmyrmawl6huvuwjxtddef7kn3fqlyabeh72gkchzy/",
  "external_link": "https://ultra.com",
  "valid_from": "2024-05-14T18:15:02.466Z",
  "valid_to": "2025-05-14T18:15:02.466Z",
  "categories": [
    "Community",
    "NFT",
    "Crypto"
  ],
  "token_metadata": {

  }
}
```

</details>

### Integrations

App base URL: `https://relayer.dsponsor.com/[chainId]/ads/[offerId]`

#### Generic

##### Get image for a specific token

Purpose: Retrieve the image for an ad offer token.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/[tokenId]/image`|`adParameterId` (default: `imageURL`)|

<details>

<summary>
 Example
</summary>

```html
<img src="https://relayer.dsponsor.com/11155111/ads/3/0/image">
```

</details>

##### Get link for a specific token

Purpose: Retrieve the link for an ad offer token.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/[tokenId]/link`|`adParameterId` (default: `linkURL`)|

<details>

<summary>
 Example
</summary>

```html
<a href="https://relayer.dsponsor.com/11155111/ads/3/0/image">
```

</details>

#### Clickable Logos Grid

Purpose: Displays a grid of clickable logos, each linking to a URL. Each ad space is displayed, tied to a token from the related ad offer.

##### Iframe

Use for: Web

<details>

<summary>
Example

</summary>

```html
 <iframe src="https://relayer.dsponsor.com/11155111/iframe/10?bgColor=0d102d" height="100%" width="100%" />
```

</details>

##### HTML table

Use for: Newsletters, GitHub READMEs

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

#### Dynamic Banner

Purpose: Displays a single clickable image, randomly selected from all validated ad spaces of an offer.  

##### Iframe

Use for: Web

*Not developed yet, coming soon*

##### Warpcast Frame

Use for: a post published on Warpcast

*Not developed yet, coming soon*
