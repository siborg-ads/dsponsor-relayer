# DSponsor Relayer

The Relayer App provides API endpoints and UI components for the [DSponsor ecosystem](https://dsponsor.com). It processes and transforms on-chain data indexed by the [DSponsor subgraph](https://github.com/dcast-media/dsponsor-subgraph) deployed on The Graph Network.

## Development setup

1. Create a `.env.local` file:

```
NEXT_ALCHEMY_API_KEY=<your-alchemy-api-key>
NEXT_DEV_URL=http://localhost:3000
```

2. Install dependencies and run the project:

```bash
npm i # install node dependencies
npm run dev # run next app locally
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to test.

## Integrations

App base URL: `https://relayer.dsponsor.com/[chainId]/integrations/[offerId]`

### Generic

#### Get image for a specific token

Purpose: Retrieve the image for an ad offer token.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/[tokenId]/image`|`adParameterId` (default: `imageURL`)|

<details>

<summary>
 Example
</summary>

```html
<img src="https://relayer.dsponsor.com/84532/integrations/2/0/image">
```

</details>

#### Get link for a specific token

Purpose: Retrieve the link for an ad offer token.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/[tokenId]/link`|`adParameterId` (default: `linkURL`)|

<details>

<summary>
 Example
</summary>

```html
<a href="https://relayer.dsponsor.com/84532/integrations/2/0/link">
```

</details>

### Clickable Logos Grid

Purpose: Displays a grid of clickable logos, each linking to a URL. Each ad space is displayed, tied to a token from the related ad offer.

#### Iframe

Use for: Web

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/ClickableLogosGrid/iFrame`|`bgColor` (default: `0d102d`), `ratio` (default: `1:1`), `previewTokenId`, `previewImage`, `previewLink`|

<details>

<summary>
Example

</summary>

```html
 <iframe sandbox="allow-same-origin allow-scripts allow-popups allow-top-navigation-by-user-activation" loading="lazy" src="https://relayer.dsponsor.com/84532/integrations/2/ClickableLogosGrid/iFrame?bgColor=ebe9e8&ratio=1:1&previewTokenId=0&previewImage=https://relayer.dsponsor.com/reserved.webp&previewLink=https://google.fr" style="width:100%; height:100%; overflow:hidden; border: none;"></iframe>
```

</details>

#### HTML table

Use for: Newsletters, GitHub READMEs

<details>

<summary>
Example
</summary>

##### HTML code

```html

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/0/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/0/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/1/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/1/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/2/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/2/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/3/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/3/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/4/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/4/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/5/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/5/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/6/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/6/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/7/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/7/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/8/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/8/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/9/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/9/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
</table>

```

##### Result

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/0/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/0/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/1/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/1/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/2/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/2/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/3/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/3/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/4/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/4/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/5/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/5/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/6/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/6/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/7/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/7/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/8/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/8/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/84532/integrations/2/9/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/84532/integrations/2/9/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
</table>

</details>

### Dynamic Banner

Purpose: Displays a single clickable image, randomly selected from all validated ad spaces of an offer.

#### Iframe

Use for: Web

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/DynamicBanner/iFrame`|`bgColor` (default: `0d102d`), `ratio` (default: `1:1`), `tokenIds` (default to all from the offer), `previewImage`, `previewLink`|

<details>

<summary>
Example

</summary>

```html
 <iframe sandbox="allow-same-origin allow-scripts allow-popups allow-top-navigation-by-user-activation" loading="lazy" src="https://relayer.dsponsor.com/84532/integrations/2/DynamicBanner/iFrame?bgColor=0d102d&ratio=5:1&tokenIds=1,2,3,4,5,6" style="width:100%; height:100%; overflow:hidden; border: none;"></iframe>
```

</details>

#### Warpcast Frame

Use for: a post published on Warpcast

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/DynamicBanner/farcasterFrame`|`items` (default: `sale,sponsor`), `ratio` (default: `1.91:1`), `tokenIds` (default to all from the offer), `tokenDataInput`, `tokenDatas`|

###### Parameters Details

* `items`:
  * `sale`: the frame will include transaction button to initiate mint, buy or bid action
  * `sponsor`: the frame will include validated ad data from the sponsor
* `ratio`: `1.91:1` or `1:1`
* `tokenIds`: restrict to a specific list of token ids
* `tokenDataInput`: if provided, display a Text field (`tokenDataInput` value as placeholder) and allow token data look up from the user input
* `tokenDatas`: restrict to a specific list of token ids from provided token data

<details>

<summary>
Example

</summary>

`https://relayer.dsponsor.com/84532/integrations/1/DynamicBanner/farcasterFrame?items=sale&ratio=1:1&tokenDatas=bitcoin&tokenDataInput=look%20for%20another%20token...`

![frameEx](./public/frame-ex.png)

</details>

## API endpoints

API base URL: `https://relayer.dsponsor.com/api/[chainId]`

### Get a sponsor's ad spaces

Purpose: Retrieve tokens from DSponsor ad offers owned by a specific wallet.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/account/[userAddress]/tokens`| |

<details>

<summary>
 Example
</summary>

#### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/account/0x9a7FAC267228f536A8f250E65d7C4CA7d39De766/tokens'
```

#### Response

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
        "creationTimestamp": "1717173216",
        "adParameters": [
            {
                "adParameter": {
                    "id": "imageURL-5:1",
                    "base": "imageURL",
                    "variants": [
                        "5:1"
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
            "id": "0x51a533e5fbc542b0df00c352d8a8a65fff1727ac",
            "allowList": false,
            "maxSupply": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
            "royalty": {
                "bps": "690",
                "receiver": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766"
            },
            "prices": [
                {
                    "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
                    "amount": "30000000",
                    "currencySymbol": "USDC",
                    "currencyDecimals": "6",
                    "minterAddress": "0x22554D70702C60A5fa30297908005B6cE19eEf51",
                    "protocolFeeBps": "400",
                    "mintPriceStructure": {
                        "creatorAmount": "30000000",
                        "protocolFeeAmount": "1200000",
                        "totalAmount": "31200000"
                    },
                    "mintPriceStructureFormatted": {
                        "creatorAmount": "30",
                        "protocolFeeAmount": "1.2",
                        "totalAmount": "31.2"
                    }
                }
            ],
            "tokens": [
                {
                    "tokenId": "109438364007015322736766724051813704643042782151430130119908516857056060615695",
                    "setInAllowList": false,
                    "marketplaceListings": [
                        {
                            "id": "24",
                            "quantity": "1",
                            "listingType": "Direct",
                            "startTime": "1718391408",
                            "endTime": "1722279408",
                            "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
                            "buyoutPricePerToken": "5000",
                            "reservePricePerToken": "5000",
                            "status": "CREATED",
                            "bids": [],
                            "currencySymbol": "USDC",
                            "currencyDecimals": "6",
                            "marketplaceAddress": "0xd36097D256F31F1BF5aa597dA7C3E098d466aD13",
                            "protocolFeeBps": "400",
                            "minimalBidBps": "1000",
                            "previousBidAmountBps": "500",
                            "bidPriceStructure": {
                                "previousBidAmount": "0",
                                "previousPricePerToken": "0",
                                "minimalBidPerToken": "5000",
                                "minimalBuyoutPerToken": "5000",
                                "newBidPerToken": "5000",
                                "totalBidAmount": "5000",
                                "refundBonusPerToken": "0",
                                "refundBonusAmount": "0",
                                "refundAmountToPreviousBidder": "0",
                                "newPricePerToken": "5000",
                                "newAmount": "5000",
                                "newRefundBonusPerToken": "250",
                                "newRefundBonusAmount": "250",
                                "protocolFeeAmount": "200",
                                "royaltyAmount": "345",
                                "listerAmount": "4455"
                            },
                            "bidPriceStructureFormatted": {
                                "previousBidAmount": "0",
                                "previousPricePerToken": "0",
                                "minimalBidPerToken": "0.005",
                                "minimalBuyoutPerToken": "0.005",
                                "newBidPerToken": "0.005",
                                "totalBidAmount": "0.005",
                                "refundBonusPerToken": "0",
                                "refundBonusAmount": "0",
                                "refundAmountToPreviousBidder": "0",
                                "newPricePerToken": "0.005",
                                "newAmount": "0.005",
                                "newRefundBonusPerToken": "0.0₃2",
                                "newRefundBonusAmount": "0.0₃2",
                                "protocolFeeAmount": "0.0₃2",
                                "royaltyAmount": "0.0₃3",
                                "listerAmount": "0.004"
                            },
                            "buyPriceStructure": {
                                "buyoutPricePerToken": "5000",
                                "listerBuyAmount": "4455",
                                "royaltiesBuyAmount": "345",
                                "protocolFeeBuyAmount": "200"
                            },
                            "buyPriceStructureFormatted": {
                                "buyoutPricePerToken": "0.005",
                                "listerBuyAmount": "0.004",
                                "royaltiesBuyAmount": "0.0₃3",
                                "protocolFeeBuyAmount": "0.0₃2"
                            }
                        }
                    ],
                    "nftContract": {
                        "id": "0x51a533e5fbc542b0df00c352d8a8a65fff1727ac",
                        "allowList": false,
                        "maxSupply": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
                        "royalty": {
                            "bps": "690",
                            "receiver": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766"
                        },
                        "prices": [
                            {
                                "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
                                "amount": "30000000",
                                "currencySymbol": "USDC",
                                "currencyDecimals": "6",
                                "minterAddress": "0x22554D70702C60A5fa30297908005B6cE19eEf51",
                                "protocolFeeBps": "400",
                                "mintPriceStructure": {
                                    "creatorAmount": "30000000",
                                    "protocolFeeAmount": "1200000",
                                    "totalAmount": "31200000"
                                },
                                "mintPriceStructureFormatted": {
                                    "creatorAmount": "30",
                                    "protocolFeeAmount": "1.2",
                                    "totalAmount": "31.2"
                                }
                            }
                        ]
                    },
                    "mint": {
                        "tokenData": "base",
                        "blockTimestamp": "1717183452"
                    },
                    "prices": [],
                    "metadata": {
                        "name": "#base - Tokenized Ad Space",
                        "description": "Tokenized advertisement spaces link to the ticker 'base' (query term in the app)\n\nBuying this ad space give you the exclusive right to submit an ad to be displayed when any user searches for 'base'.\nSiBorg team still has the power to validate or reject ad assets.\nYou are free to change the ad proposal at anytime and free to resell it on the open market.",
                        "image": "https://placehold.co/400x400?text=SiBorg%20Ad%20Space%0Abase",
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
                        },
                        "external_url": "",
                        "attributes": [
                            {
                                "trait_type": "Search Query",
                                "value": "base"
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
```

</details>

### Ad spaces data for an offer

Purpose: Retrieve data to display on sponsors' interfaces.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/ads/[offerId]`| `tokenIds` (optionnal), `tokenData` (optionnal), `adParameterIds` (optionnal)|

<details>

<summary>
 Example
</summary>

#### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/ads/1?tokenData=web3,twitter,staking&adParameterIds=imageURL,linkURL'
```

#### Response

```json
{
    "_tokenIds": [
        "65329693524297118063646238334159138948524025175806621014596919199733788562630",
        "101661046026135114031620108954831493212219976668510473490175828180454937635060",
        "64873369441774726751632143071124460964591437972899336413549633584093280026386"
    ],
    "_tokenData": [
        "web3",
        "twitter",
        "staking"
    ],
    "_adParameterIds": [
        "imageURL-5:1",
        "linkURL"
    ],
    "65329693524297118063646238334159138948524025175806621014596919199733788562630": {
        "_tokenData": "web3",
        "_buy": {
            "link": "https://app.dsponsor.com/sepolia/offer/1/65329693524297118063646238334159138948524025175806621014596919199733788562630?tokenData=web3",
            "mint": null,
            "secondary": {
                "id": "19",
                "quantity": "1",
                "listingType": "Direct",
                "startTime": "1717183164",
                "endTime": "1719861564",
                "currency": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
                "buyoutPricePerToken": "400000000000",
                "reservePricePerToken": "400000000000",
                "status": "CREATED",
                "bids": [],
                "currencySymbol": "WETH",
                "currencyDecimals": "18",
                "marketplaceAddress": "0xd36097D256F31F1BF5aa597dA7C3E098d466aD13",
                "protocolFeeBps": "400",
                "minimalBidBps": "1000",
                "previousBidAmountBps": "500",
                "bidPriceStructure": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "400000000000",
                    "minimalBuyoutPerToken": "400000000000",
                    "newBidPerToken": "400000000000",
                    "totalBidAmount": "400000000000",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "400000000000",
                    "newAmount": "400000000000",
                    "newRefundBonusPerToken": "20000000000",
                    "newRefundBonusAmount": "20000000000",
                    "protocolFeeAmount": "16000000000",
                    "royaltyAmount": "27600000000",
                    "listerAmount": "356400000000"
                },
                "bidPriceStructureFormatted": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "0.0₆4",
                    "minimalBuyoutPerToken": "0.0₆4",
                    "newBidPerToken": "0.0₆4",
                    "totalBidAmount": "0.0₆4",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "0.0₆4",
                    "newAmount": "0.0₆4",
                    "newRefundBonusPerToken": "0.0₇2",
                    "newRefundBonusAmount": "0.0₇2",
                    "protocolFeeAmount": "0.0₇2",
                    "royaltyAmount": "0.0₇3",
                    "listerAmount": "0.0₆3"
                },
                "buyPriceStructure": {
                    "buyoutPricePerToken": "400000000000",
                    "listerBuyAmount": "356400000000",
                    "royaltiesBuyAmount": "27600000000",
                    "protocolFeeBuyAmount": "16000000000"
                },
                "buyPriceStructureFormatted": {
                    "buyoutPricePerToken": "0.0₆4",
                    "listerBuyAmount": "0.0₆3",
                    "royaltiesBuyAmount": "0.0₇3",
                    "protocolFeeBuyAmount": "0.0₇2"
                }
            }
        },
        "imageURL-5:1": {
            "state": "BUY_MARKET",
            "data": "http://localhost:3000/available-1-1.png"
        },
        "linkURL": {
            "state": "BUY_MARKET",
            "data": "https://app.dsponsor.com/sepolia/offer/1/65329693524297118063646238334159138948524025175806621014596919199733788562630?tokenData=web3"
        }
    },
    "101661046026135114031620108954831493212219976668510473490175828180454937635060": {
        "_tokenData": "twitter",
        "_buy": {
            "link": "https://app.dsponsor.com/sepolia/offer/1/101661046026135114031620108954831493212219976668510473490175828180454937635060?tokenData=twitter",
            "mint": [
                {
                    "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
                    "amount": "30000000",
                    "currencySymbol": "USDC",
                    "currencyDecimals": "6",
                    "minterAddress": "0x22554D70702C60A5fa30297908005B6cE19eEf51",
                    "protocolFeeBps": "400",
                    "mintPriceStructure": {
                        "creatorAmount": "30000000",
                        "protocolFeeAmount": "1200000",
                        "totalAmount": "31200000"
                    },
                    "mintPriceStructureFormatted": {
                        "creatorAmount": "30",
                        "protocolFeeAmount": "1.2",
                        "totalAmount": "31.2"
                    }
                }
            ],
            "secondary": null
        },
        "imageURL-5:1": {
            "state": "BUY_MINT",
            "data": "http://localhost:3000/available-1-1.png"
        },
        "linkURL": {
            "state": "BUY_MINT",
            "data": "https://app.dsponsor.com/sepolia/offer/1/101661046026135114031620108954831493212219976668510473490175828180454937635060?tokenData=twitter"
        }
    },
    "64873369441774726751632143071124460964591437972899336413549633584093280026386": {
        "_tokenData": "staking",
        "_buy": {
            "link": "https://app.dsponsor.com/sepolia/offer/1/64873369441774726751632143071124460964591437972899336413549633584093280026386?tokenData=staking",
            "mint": null,
            "secondary": null
        },
        "imageURL-5:1": {
            "state": "UNAVAILABLE",
            "data": "http://localhost:3000/reserved-1-1.png"
        },
        "linkURL": {
            "state": "UNAVAILABLE",
            "data": "https://app.dsponsor.com/sepolia/offer/1/64873369441774726751632143071124460964591437972899336413549633584093280026386?tokenData=staking"
        }
    }
}
```

</details>

### Warpcast Frame Metadata

Purpose: Retrieve valid metadata to display on a Warpcast post.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET` or `POST`|`/ads/[offerId]/frames`|`items` (default: `sale,sponsor`), `ratio` (default: `1.91:1`), `tokenIds` (default to all from the offer), `tokenDataInput`, `tokenDatas`|

#### Parameters Details

* `items`:
  * `sale`: the frame will include transaction button to initiate mint, buy or bid action
  * `sponsor`: the frame will include validated ad data from the sponsor
* `ratio`: `1.91:1` or `1:1`
* `tokenIds`: restrict to a specific list of token ids
* `tokenDataInput`: if provided, display a Text field and allow token data look up from the text input. Text field placeholder takes the `tokenDataInput`
* `tokenDatas`: restrict to a specific list of token ids from provided token data

<details>

<summary>
Example

</summary>

#### Request

```bash
curl https://relayer.dsponsor.com/api/84532/ads/1/frames?items=sale&ratio=1:1&tokenDatas=bitcoin&tokenDataInput=look%20for%20another%20token...
```

#### Response

```html
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta property="fc:frame" content="vNext"/>
      <meta property="fc:frame:image:aspect_ratio" content="1.91:1"/>
      <meta property="fc:frame:image" content="https://relayer.dsponsor.com/api/84532/ads/1/frames/image?image=N4IgLghg5iBcIBMCWA3EAaEAHATgeywGc5RCwBPAGwFMTElCtKJy4QAzGgDww%252B4BEkOagGMwSPADs2IvJQCuAW2mYAFtSRRVYNgEYADPoCkvAO5IEYVXsMmAvphGqklBMOmxQuAsU8gnLm7UHl74RHSEOCJs2mBEsAD0CcLM5NQ4AHQIjFKEeJmyigkQKBAuEABGNAC0urUZWJIwmBCUOvDsOBCK1ACSis0geBUAVqJgAGJI7f5SkEgqIOaW1vAGxrzqmto2Gw7%252Bzq7ucADaALqYDACihCIQWNQIcGA48tR2%252BwFHwaehPhFRGJgOKERLJaipdJZHKSPIFPBFEplZhVai1eqNQatGadbp9Aa8YZjMRTGaySTzRbLKy7ExqDRaGbreyOQ5BDznS6EG53B5PWAvN52C4ga63e6PZ6vd6fNnHWAnUCQGDwZBoTDecJ%252BMhUWh%252BWSUfJsADE7DN5t4yEYqTYnGoPEwdq4gmEYgkHlmCmUvHYcwAykgAF56kAAZn0GQALAB2ABsugAnPoY-GkzHI1geLLAvK-lrSID4LF4kkUiwodksLl8hlCsVSuVUejdA0mrxsbauj1%252BoMieNSTI5mUqRYaWtbJsGTtx3tWTmfgqRWLeZKBdKPnPvhyldA2EgCRqwr5SBQaHQtozaYTRv3poOKcOzKPViBmbwDUb4KbzWbLQwmCwtrcD6AhCOM7qDl6iy%252BhSAbBmw4ZRnGibJshabRhmWaYJE0RFsCJbgpCmSVtW8KIg2KI1HULaYiA2ZbqcS7cuKfJSkKTE8hK-KCu8HEsauPF2EAA"/>
      <meta property="og:image" content="https://relayer.dsponsor.com/api/84532/ads/1/frames/image?image=N4IgLghg5iBcIBMCWA3EAaEAHATgeywGc5RCwBPAGwFMTElCtKJy4QAzGgDww%252B4BEkOagGMwSPADs2IvJQCuAW2mYAFtSRRVYNgEYADPoCkvAO5IEYVXsMmAvphGqklBMOmxQuAsU8gnLm7UHl74RHSEOCJs2mBEsAD0CcLM5NQ4AHQIjFKEeJmyigkQKBAuEABGNAC0urUZWJIwmBCUOvDsOBCK1ACSis0geBUAVqJgAGJI7f5SkEgqIOaW1vAGxrzqmto2Gw7%252Bzq7ucADaALqYDACihCIQWNQIcGA48tR2%252BwFHwaehPhFRGJgOKERLJaipdJZHKSPIFPBFEplZhVai1eqNQatGadbp9Aa8YZjMRTGaySTzRbLKy7ExqDRaGbreyOQ5BDznS6EG53B5PWAvN52C4ga63e6PZ6vd6fNnHWAnUCQGDwZBoTDecJ%252BMhUWh%252BWSUfJsADE7DN5t4yEYqTYnGoPEwdq4gmEYgkHlmCmUvHYcwAykgAF56kAAZn0GQALAB2ABsugAnPoY-GkzHI1geLLAvK-lrSID4LF4kkUiwodksLl8hlCsVSuVUejdA0mrxsbauj1%252BoMieNSTI5mUqRYaWtbJsGTtx3tWTmfgqRWLeZKBdKPnPvhyldA2EgCRqwr5SBQaHQtozaYTRv3poOKcOzKPViBmbwDUb4KbzWbLQwmCwtrcD6AhCOM7qDl6iy%252BhSAbBmw4ZRnGibJshabRhmWaYJE0RFsCJbgpCmSVtW8KIg2KI1HULaYiA2ZbqcS7cuKfJSkKTE8hK-KCu8HEsauPF2EAA"/>
      <meta property="og:title" content="Frog Frame"/>
      <meta property="fc:frame:post_url" content="https://relayer.dsponsor.com/api/84532/ads/1/frames?initialPath=%252Fapi%252F84532%252Fads%252F1%252Fframes&amp;previousButtonValues=%2523A_%252C_t%252C_l"/>
      <meta property="fc:frame:input:text" content="look for another token..."/>
      <meta property="fc:frame:button:1" content="Lookup"/>
      <meta property="fc:frame:button:1:action" content="post"/>
      <meta property="fc:frame:button:1:target" content="https://relayer.dsponsor.com/api/84532/ads/1/frames?initialPath=%252Fapi%252F84532%252Fads%252F1%252Fframes&amp;previousButtonValues=%2523A_%252C_t%252C_l"/>
      <meta property="fc:frame:button:2" content="Bid" data-value="_t"/>
      <meta property="fc:frame:button:2:action" content="tx"/>
      <meta property="fc:frame:button:2:target" content="https://relayer.dsponsor.com/api/84532/ads/1/frames/56960375584792109628315999883526364004747792730920852649053369508622489636429/txdata/Bid"/>
      <meta property="fc:frame:button:2:post_url" content="https://relayer.dsponsor.com/api/84532/ads/1/frames/56960375584792109628315999883526364004747792730920852649053369508622489636429/txres?initialPath=%252Fapi%252F84532%252Fads%252F1%252Fframes&amp;previousButtonValues=%2523A_%252C_t%252C_l"/>
      <meta property="fc:frame:button:3" content="Details" data-value="_l"/>
      <meta property="fc:frame:button:3:action" content="link"/>
      <meta property="fc:frame:button:3:target" content="https://app.dsponsor.com/base-sepolia/offer/1/56960375584792109628315999883526364004747792730920852649053369508622489636429?tokenData=bitcoin"/>
      <meta property="frog:version" content="0.11.4"/>
   </head>
   <body></body>
</html>
```

</details>

### Graph proxy

Purpose: Relay any GraphQL request to the DSponsor subgraph.

It also populate:

* offer metadata (`offer.metadata`, if `adOffer --> metadataURL` is provided and valid)
* token metadata (`token.metadata`, if `adOffer --> metadataURL` is provided and valid)
* mint price (`price.mintPriceStructure` & `price.mintPriceStructureFormatted`,
if `price --> amount` & `price --> currency` are provided)
* secondary buy & bid structures (`marketplaceListing.bidPriceStructure` & `marketplaceListing.bidPriceStructureFormatted`,`marketplaceListing.buyPriceStructure` & `marketplaceListing.buyPriceStructureFormatted`, if `marketplaceListings --> reservePricePerToken`, `marketplaceListings --> buyoutPricePerToken`,  `marketplaceListings --> currency`, `marketplaceListings --> quantity`, `marketplaceListings --> bids --> totalBidAmount`, `nftContract --> royalty --> bps` are provided)

|Method|Endpoint|Parameters|
|--|--|--|
|`GET` or `POST`|`/graph`| `query` (required), `variables` (required)|

You can use [Apollo's Sandbox](https://studio.apollographql.com/sandbox/explorer), with `https://relayer.dsponsor.com/api/11155111/graph` set as the endpoint for example.

<details>

<summary>
 Example
</summary>

#### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/graph' \
  --data-raw '{
    "query": "query OfferRequest($offerId: String, $tokenId: BigInt) {
      adOffers(where: { id: $offerId }) {
        id
        metadataURL
        nftContract {
          royalty {
            bps
            receiver
          }
          prices {
            currency
            amount
            enabled
          }
          tokens(where: { tokenId: $tokenId }) {
            tokenId
            mint {
              blockTimestamp
              tokenData
            }
            prices {
              currency
              amount
              enabled
            }
            marketplaceListings {
              id
              quantity
              buyoutPricePerToken
              reservePricePerToken
              currency
              bids {
                totalBidAmount
              }
              token {
                nftContract {
                  royalty {
                    bps
                    receiver
                  }
                  allowList
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "offerId": "1",
      "tokenId": "109438364007015322736766724051813704643042782151430130119908516857056060615695"
    },
    "operationName": "OfferRequest"
  }'
```

#### Response

```json
{
  "data": {
    "adOffers": [
      {
        "id": "1",
        "metadataURL": "https://bafkreicmn6gia3cplyt7tu56sfue6cpw5dm2dnwuz2zkj4dhqrg5bzwuua.ipfs.nftstorage.link/",
        "nftContract": {
          "royalty": {
            "bps": "690",
            "receiver": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766"
          },
          "prices": [
            {
              "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
              "amount": "30000000",
              "enabled": true,
              "currencySymbol": "USDC",
              "currencyDecimals": "6",
              "minterAddress": "0x22554D70702C60A5fa30297908005B6cE19eEf51",
              "protocolFeeBps": "400",
              "mintPriceStructure": {
                "creatorAmount": "30000000",
                "protocolFeeAmount": "1200000",
                "totalAmount": "31200000"
              },
              "mintPriceStructureFormatted": {
                "creatorAmount": "30",
                "protocolFeeAmount": "1.2",
                "totalAmount": "31.2"
              }
            }
          ],
          "tokens": [
            {
              "tokenId": "109438364007015322736766724051813704643042782151430130119908516857056060615695",
              "mint": {
                "blockTimestamp": "1717183452",
                "tokenData": "base"
              },
              "prices": [],
              "marketplaceListings": [
                {
                  "id": "24",
                  "quantity": "1",
                  "buyoutPricePerToken": "5000",
                  "reservePricePerToken": "5000",
                  "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
                  "bids": [],
                  "token": {
                    "nftContract": {
                      "royalty": {
                        "bps": "690",
                        "receiver": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766"
                      },
                      "allowList": false
                    }
                  },
                  "currencySymbol": "USDC",
                  "currencyDecimals": "6",
                  "marketplaceAddress": "0xd36097D256F31F1BF5aa597dA7C3E098d466aD13",
                  "protocolFeeBps": "400",
                  "minimalBidBps": "1000",
                  "previousBidAmountBps": "500",
                  "bidPriceStructure": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "5000",
                    "minimalBuyoutPerToken": "5000",
                    "newBidPerToken": "5000",
                    "totalBidAmount": "5000",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "5000",
                    "newAmount": "5000",
                    "newRefundBonusPerToken": "250",
                    "newRefundBonusAmount": "250",
                    "protocolFeeAmount": "200",
                    "royaltyAmount": "345",
                    "listerAmount": "4455"
                  },
                  "bidPriceStructureFormatted": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "0.005",
                    "minimalBuyoutPerToken": "0.005",
                    "newBidPerToken": "0.005",
                    "totalBidAmount": "0.005",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "0.005",
                    "newAmount": "0.005",
                    "newRefundBonusPerToken": "0.0₃2",
                    "newRefundBonusAmount": "0.0₃2",
                    "protocolFeeAmount": "0.0₃2",
                    "royaltyAmount": "0.0₃3",
                    "listerAmount": "0.004"
                  },
                  "buyPriceStructure": {
                    "buyoutPricePerToken": "5000",
                    "listerBuyAmount": "4455",
                    "royaltiesBuyAmount": "345",
                    "protocolFeeBuyAmount": "200"
                  },
                  "buyPriceStructureFormatted": {
                    "buyoutPricePerToken": "0.005",
                    "listerBuyAmount": "0.004",
                    "royaltiesBuyAmount": "0.0₃3",
                    "protocolFeeBuyAmount": "0.0₃2"
                  }
                }
              ],
              "metadata": {
                "name": "#base - Tokenized Ad Space",
                "description": "Tokenized advertisement spaces link to the ticker 'base' (query term in the app)\n\nBuying this ad space give you the exclusive right to submit an ad to be displayed when any user searches for 'base'.\nSiBorg team still has the power to validate or reject ad assets.\nYou are free to change the ad proposal at anytime and free to resell it on the open market.",
                "image": "https://placehold.co/400x400?text=SiBorg%20Ad%20Space%0Abase",
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
                },
                "external_url": "",
                "attributes": [
                  {
                    "trait_type": "Search Query",
                    "value": "base"
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

### Price quotes

Purpose: Retrieve USD and ETH prices for a specific token from Uniswap.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/prices`|`token` (required), `amount` (required), `splippage` (required)|

<details>

<summary>
 Example (0.00002 UNI, 0.3% slippage)
</summary>

#### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/prices?token=0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984&amount=20000000000000&slippage=0.3'
```

#### Response

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

### Token metadata

Purpose: Retrieve token metadata according to the official ERC721 metadata standard.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET`|`/tokenMetadata/[nftcontract]/[tokenId]`||

<details>

<summary>
 Example
</summary>

#### Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/tokenMetadata/0x51a533e5fbc542b0df00c352d8a8a65fff1727ac/109438364007015322736766724051813704643042782151430130119908516857056060615695'
```

#### Response

```json
{
  "name": "#base - Tokenized Ad Space",
  "description": "Tokenized advertisement spaces link to the ticker 'base' (query term in the app)\n\nBuying this ad space give you the exclusive right to submit an ad to be displayed when any user searches for 'base'.\nSiBorg team still has the power to validate or reject ad assets.\nYou are free to change the ad proposal at anytime and free to resell it on the open market.",
  "image": "https://placehold.co/400x400?text=SiBorg%20Ad%20Space%0Abase",
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
  },
  "external_url": "",
  "attributes": [
    {
      "trait_type": "Search Query",
      "value": "base"
    }
  ]
}
```

Result on [Opensea](https://testnets.opensea.io/fr/assets/sepolia/0x51a533e5fbc542b0df00c352d8a8a65fff1727ac/109438364007015322736766724051813704643042782151430130119908516857056060615695):

![opensea-dsponsor](./public/opensea-example.png)

</details>
