# DSponsor Relayer

The Relayer App provides API endpoints and UI components for the [DSponsor ecosystem](https://dsponsor.com). It processes and transforms on-chain data indexed by the [DSponsor subgraph](https://github.com/dcast-media/dsponsor-subgraph) deployed on The Graph Network.

- [DSponsor Relayer](#dsponsor-relayer)
  - [Development setup](#development-setup)
  - [Caching strategy](#caching-strategy)
    - [Front end usage](#front-end-usage)
  - [Integrations](#integrations)
    - [Generic](#generic)
      - [Get image for a specific token](#get-image-for-a-specific-token)
      - [Get link for a specific token](#get-link-for-a-specific-token)
    - [Clickable Logos Grid](#clickable-logos-grid)
      - [Iframe](#iframe)
      - [HTML table](#html-table)
    - [Dynamic Banner](#dynamic-banner)
      - [Dynamic Banner Iframe](#dynamic-banner-iframe)
      - [Warpcast Frame](#warpcast-frame)
        - [Warpcast Frame Parameters Details](#warpcast-frame-parameters-details)
        - [Warpcast Frame Response](#warpcast-frame-response)
      - [Image only](#image-only)
    - [DataWrapper integration](#datawrapper-integration)
  - [API endpoints](#api-endpoints)
    - [Users activity](#users-activity)
    - [Ad spaces data for an offer](#ad-spaces-data-for-an-offer)
    - [Ads data in CSV format](#ads-data-in-csv-format)
    - [Graph proxy](#graph-proxy)
    - [Price quote](#price-quote)
    - [Token metadata](#token-metadata)
    - [Ad offer data related to user](#ad-offer-data-related-to-user)

## Development setup

1. Create and complete a `.env.local` file:

```env
# required
COINGECKO_API_KEY=CG-xxxxxxxxxxxx

# from src/config, you may need it
NEXT_DEV_URL=http://localhost:3000
SUBGRAPH_ALCHEMY_KEY=xxxxx
THEGRAPH_API_KEY=xxxxxxxxxx

# Datawrapper integration
DATAWRAPPER_API_KEY=xxxxxxxxxxxxxxxxxx
DATAWRAPPER_TEMPLATE_ID=xxxxx

# optionnal debug
NEXT_CACHE_LOGS=datacache,verbose
```

2. Install dependencies and run the project:

```bash
npm i -f # force install node dependencies
npm run dev # run next app locally
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to test.

## Caching strategy

Responses from the Relayer are cached with on-demand revalidation using tags. To update the cache, you may need to send a POST request to the `/api/revalidate` route. Check the `Cache tags` information for each endpoint below to know which cache tags are used.

```bash
curl 'https://relayer.dsponsor.com/api/revalidate' --data-raw '{"tags": ["11155111-adOffer-1"] }'
```

### Front end usage

Revalidation request for the following actions is required:

|Action|Tags to revalidate|
|-|-|
|Create ad offer|[`${chainId}-userAddress-${creatorAddress}`,`${chainId}-adOffers`]|
|Update ad offer information, Update mint price|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`]|
|Airdrop token|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`, `${chainId}-userAddress-${ownerAddress}`]|
|Mint token|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`, `${chainId}-userAddress-${ownerAddress}`,`${chainId}-activity`]|
|Transfer token|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`,`${chainId}-userAddress-${prevOwnerAddress}`, `${chainId}-userAddress-${newOwnerAddress}`]|
|Create, Cancel listing|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`, `${chainId}-userAddress-${listerAddress}`]|
|Buy, Bid, Close listing|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`, `${chainId}-userAddress-${listerAddress}`,`${chainId}-userAddress-${buyerAddress}`,`${chainId}-activity`]|
|Bid|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`, `${chainId}-userAddress-${listerAddress}`,`${chainId}-userAddress-${previousBidderAddress}`,`${chainId}-userAddress-${newBidderAddress}`,`${chainId}-activity`]|
|Ad submission/validation|[`${chainId}-nftContract-${offerNftContractAddr}`,`${chainId}-adOffer-${adOfferId}`, `${chainId}-userAddress-${ownerAddress}`,`${chainId}-userAddress-${adminAddress}`,`${chainId}-userAddress-${validatorAddress}`]|

## Integrations

App base URL: `https://relayer.dsponsor.com/[chainId]/integrations/[offerId]`

### Generic

#### Get image for a specific token

Purpose: Retrieve the image for an ad offer token.

|Method|Endpoint|Parameters|Cache tags|
|--|--|--|--|
|`GET`|`/[tokenId]/image`|`ratio`, `includeAvailable` (default: `true`, return CTA image if no validated ads but token is available on the market), `includeReserved` (default: `true`, return informative image if no validated ads and unavailable on the market),`adParameterId` (default: `imageURL`)|[`${chainId}-adOffer-${adOfferId}`]|

<details>

<summary>
 Example
</summary>

```html
<img src="https://relayer.dsponsor.com/11155111/integrations/35/0/image">
```

</details>

#### Get link for a specific token

Purpose: Retrieve the link for an ad offer token.

|Method|Endpoint|Parameters|Cache tags|
|--|--|--|--|
|`GET`|`/[tokenId]/link`|`adParameterId` (default: `linkURL`)|[`${chainId}-adOffer-${adOfferId}`]|

<details>

<summary>
 Example
</summary>

```html
<a href="https://relayer.dsponsor.com/11155111/integrations/35/0/link">
```

</details>

### Clickable Logos Grid

Purpose: Displays a grid of clickable logos, each linking to a URL. Each ad space is displayed, tied to a token from the related ad offer.

#### Iframe

Use for: Web

|Method|Endpoint|Parameters|Cache tags|
|--|--|--|--|
|`GET`|`/ClickableLogosGrid/iFrame`|`bgColor` (default: `0d102d`), `includeAvailable` (default: `true`, ad tokens with no ads but available on the market displayed), `includeReserved` (default: `true`, ad tokens with no validated ads and unavailable on the market displayed), `ratio`, `previewTokenId`, `previewImage`, `previewLink`|[`${chainId}-adOffer-${adOfferId}`]|

<details>

<summary>
Example

</summary>

```html
 <iframe sandbox="allow-same-origin allow-scripts allow-popups allow-top-navigation-by-user-activation" loading="lazy" src="https://relayer.dsponsor.com/11155111/integrations/35/ClickableLogosGrid/iFrame?bgColor=ebe9e8&ratio=1:1&previewTokenId=0&previewImage=https://relayer.dsponsor.com/reserved.webp&previewLink=https://google.fr" style="width:100%; height:100%; overflow:hidden; border: none;"></iframe>
```

</details>

#### HTML table

Use for: Newsletters, GitHub READMEs

<details>

<summary>
Example
</summary>

- HTML code

```html

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/0/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/0/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/1/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/1/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/2/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/2/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/3/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/3/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>  
  </tr> 
</table>

```

- Result

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/0/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/0/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/1/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/1/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/2/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/2/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/integrations/35/3/link" target="_blank" rel="noopener noreferrer">
        <img src="https://relayer.dsponsor.com/11155111/integrations/35/3/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
      </a>
    </td>  
  </tr>
</table>

</details>

### Dynamic Banner

Purpose: Displays a single clickable image, randomly selected from all validated ad spaces of an offer.

#### Dynamic Banner Iframe

Use for: Web

|Method|Endpoint|Parameters|Cache Tags|
|--|--|--|--|
|`GET`|`/DynamicBanner/iFrame`|`bgColor` (default: `0d102d`), `includeAvailable` (default: `true`, ad tokens with no ads but available on the market displayed), `includeReserved` (default: `true`, ad tokens with no validated ads and unavailable on the market displayed), `ratio`, `tokenIds` (default to all from the offer), `previewImage`, `previewLink`|[`${chainId}-adOffer-${adOfferId}`]|

<details>

<summary>
Example

</summary>

```html
 <iframe sandbox="allow-same-origin allow-scripts allow-popups allow-top-navigation-by-user-activation" loading="lazy" src="https://relayer.dsponsor.com/11155111/integrations/35/DynamicBanner/iFrame?bgColor=0d102d&ratio=5:1&tokenIds=1,2" style="width:100%; height:100%; overflow:hidden; border: none;"></iframe>
```

</details>

#### Warpcast Frame

Use for: a post published on Warpcast

|Method|Endpoint|Parameters|Cache Tags|
|--|--|--|--|
|`GET`|`/DynamicBanner/farcasterFrame`|`items` (default: `sale,sponsor`), `ratio` (default: `1.91:1`), `tokenIds` (default to all from the offer), `tokenDataInput`, `tokenDatas`|[`${chainId}-adOffer-${adOfferId}`]|

##### Warpcast Frame Parameters Details

- `items`:
  - `sale`: the frame will include transaction button to initiate mint, buy or bid action
  - `sponsor`: the frame will include validated ad data from the sponsor
- `ratio`: `1.91:1` or `1:1`
- `tokenIds`: restrict to a specific list of token ids
- `tokenDataInput`: if provided, display a Text field (`tokenDataInput` value as placeholder) and allow token data look up from the user input
- `tokenDatas`: restrict to a specific list of token ids from provided token data

<details>

<summary>
Example

</summary>

`https://relayer.dsponsor.com/84532/integrations/1/DynamicBanner/farcasterFrame?items=sale&ratio=1:1&tokenDatas=bitcoin&tokenDataInput=look%20for%20another%20token...`

##### Warpcast Frame Response

![frameEx](./public/frame-ex.png)

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

#### Image only

Use for: Newsletter, GitHub repo, ...

|Method|Endpoint|Parameters|Cache tags|
|--|--|--|--|
|`GET`|`/DynamicBanner/image`|`ratio`, `includeAvailable` (default: `true`, return CTA image if no validated ads but one available on the market), `includeReserved` (default: `true`, return informative image if no validated ads and unavailable on the market), `tokenIds` (default to all from the offer)|[`${chainId}-adOffer-${adOfferId}`]|

<details>

<summary>
Example

</summary>

- HTML code

```html
  <img src="https://relayer.dsponsor.com/11155111/integrations/35/DynamicBanner/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">
```

- Result

  <img src="https://relayer.dsponsor.com/11155111/integrations/35/DynamicBanner/image" style="max-width: 100%; height: auto; display: block;" alt="No Ad">

</details>

### DataWrapper integration

Purpose: Displays ads in a [DataWrapper](https://www.datawrapper.de/) table. It can be use to display ads on Substack (App & Web only) with [Datawrapper integration](https://support.substack.com/hc/en-us/articles/15722290158100-How-do-I-embed-Datawrapper-charts-in-a-Substack-post)

|Method|Endpoint|Parameters|Cache Tags|
|--|--|--|--|
|`GET`|`/Datawrapper`| `type` (`grid` or `dynamic`), `adParameterIds` (optionnal), `includeAvailable` (default : true), `includeReserved` (default: true)|[`${chainId}-adOffer-${adOfferId}`]|

`type` is set to `grid` by default, to get all ads in the DataWraper table. You can choose `dynamic` to get only one row, with a randomly selected ad.

DataWrapper tables are created from a template (`DATAWRAPPER_TEMPLATE_ID` environment variable) and an account API key
(`DATAWRAPPER_API_KEY` environment variable).  

The route returns a JSON with a `publicUrl` link. Copy paste this link in a Substack post to have a Datawrapper table with the ads. **Note this integration won't work if the Substack post is sent by mail.**

<details>

<summary>
 Example
</summary>

- Request

```bash
curl 'https://relayer.dsponsor.com/11155111/integrations/48/Datawrapper?type=grid&includeAvailable=false'
```

- Response

```json
{
  "title": "11155111-48-grid-imageURL-16:9,linkURL-false-true",
  "publicId": "a1lvX",
  "publicUrl": "https://datawrapper.dwcdn.net/a1lvX/1/",
  "createdAt": "2024-09-24T10:41:32.000Z",
  "lastModifiedAt": "2024-09-24T10:41:36.515Z"
}
```

![img](./public/datawrapper-ex.png)

</details>

## API endpoints

API base URL: `https://relayer.dsponsor.com/api/[chainId]`

### Users activity

Purpose: Retrieve all users activity

|Method|Endpoint|Parameters|Cache tags|
|--|--|--|--|
|`GET`|`/activity`| `fromTimestamp` (optionnal), `toTimestamp` (optionnal), `userAddress` (optionnal), `nftContractAddress` (optionnal)|[`${chainId}-adOffers`,`${chainId}-userAddress-${getAddress(userAddress)}`,`${chainId}-nftContract-${getAddress(nftContract)}`], for each `nftContractAddress` of all offers|

<details>

<summary>
 Example
</summary>

- Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/activity?userAddress=0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b'
```

- Response

```json
{
  "totalBids": 1,
  "nbHolders": 1,
  "nbRevenueCalls": 4,
  "totalUsdRevenueFees": 0.0061270000000000005,
  "totalNbPoints": 0.0061270000000000005,
  "lastBid": {
    "blockTimestamp": "1719843684",
    "bidderAddr": "0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b",
    "listingId": "0",
    "listing": {
      "tokenId": "64811535694367703682769931475725916177454416984783473390709242422588226989409",
      "contractAddress": "0xe1fdb9bf84368032e352c4a8050fa0a4d7b2d6ae",
      "offerId": "1",
      "tokenData": "farcaster"
    },
    "lastBidderDisplayAddr": "0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b",
    "date": "2024-07-01T14:21:24.000Z"
  },
  "lastActivities": [
    {
      "date": "2024-08-26T16:47:48.000Z",
      "blockTimestamp": "1724690868",
      "transactionHash": "0xda49c125832984a777aeb7a5ccc03553df086462feeeeb044885e9559bf9d84c",
      "type": "mint",
      "currency": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      "fee": "800",
      "enabler": "0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b",
      "spender": "0x9a7FAC267228f536A8f250E65d7C4CA7d39De766",
      "refAddr": "0x5b15Cbb40Ef056F74130F0e6A1e6FD183b14Cdaf",
      "referralAddresses": [
        "0x5b15cbb40ef056f74130f0e6a1e6fd183b14cdaf"
      ],
      "offerId": "38",
      "offerName": "CoinReport",
      "tokenId": "0",
      "tokenData": "",
      "symbol": "WETH",
      "decimals": 18,
      "points": 0,
      "usdcAmount": "0"
    },
    {
      "date": "2024-07-10T15:59:12.000Z",
      "blockTimestamp": "1720627152",
      "transactionHash": "0x9362c83a59e8d700b1ffa92f3c7432b14de836dbe12ccbc8930e7dfce84804ea",
      "type": "mint",
      "currency": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      "fee": "400000000000",
      "enabler": "0x8333c1B5131CC694c3A238E41e50cbc236e73DbC",
      "spender": "0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b",
      "refAddr": "0x5b15Cbb40Ef056F74130F0e6A1e6FD183b14Cdaf",
      "referralAddresses": [
        "0x5b15cbb40ef056f74130f0e6a1e6fd183b14cdaf"
      ],
      "offerId": "8",
      "offerName": "Bob L'éponge v2",
      "tokenId": "4",
      "tokenData": "",
      "symbol": "WETH",
      "decimals": 18,
      "points": 0.001225,
      "usdcAmount": "1225"
    },
    {
      "date": "2024-07-10T15:30:48.000Z",
      "blockTimestamp": "1720625448",
      "transactionHash": "0xa6f6d43cc29b8cae1b715118c79d00a511049bc484e47200540a9341e157e66e",
      "type": "buy",
      "currency": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      "fee": "1200000000000",
      "enabler": "0x8333c1B5131CC694c3A238E41e50cbc236e73DbC",
      "spender": "0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b",
      "refAddr": "0x5b15Cbb40Ef056F74130F0e6A1e6FD183b14Cdaf",
      "referralAddresses": [
        "0x5b15cbb40ef056f74130f0e6a1e6fd183b14cdaf"
      ],
      "offerId": "1",
      "offerName": "SiBorg Ads",
      "tokenId": "110771216890900307486995680796878979552050216338441285842533727414245120540081",
      "tokenData": "airdrop",
      "symbol": "WETH",
      "decimals": 18,
      "points": 0.003677,
      "usdcAmount": "3677"
    },
    {
      "date": "2024-07-10T07:40:12.000Z",
      "blockTimestamp": "1720597212",
      "transactionHash": "0x6850b79f78ec2c42ba0d5153cae2ca98c395e3a95cade38b9c73d1c52c1e2519",
      "type": "mint",
      "currency": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      "fee": "400000000000",
      "enabler": "0x8333c1B5131CC694c3A238E41e50cbc236e73DbC",
      "spender": "0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b",
      "refAddr": "0x5b15Cbb40Ef056F74130F0e6A1e6FD183b14Cdaf",
      "referralAddresses": [
        "0x5b15cbb40ef056f74130f0e6a1e6fd183b14cdaf"
      ],
      "offerId": "8",
      "offerName": "Bob L'éponge v2",
      "tokenId": "1",
      "tokenData": "",
      "symbol": "WETH",
      "decimals": 18,
      "points": 0.001225,
      "usdcAmount": "1225"
    }
  ],
  "rankings": [
    {
      "addr": "0x747923D9eC6c94521aCccc6F3d065C3772f3fa6b",
      "balance": 4,
      "nbBids": 1,
      "nbRefunds": 1,
      "nbProtocolFeeBuys": 3,
      "nbProtocolFeeSells": 0,
      "nbProtocolFeeReferrals": 0,
      "points": 0,
      "currenciesAmounts": {
        "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14": {
          "totalSpent": "-150000000000000",
          "totalReceived": "150000000000000",
          "bidSpent": "-150000000000000",
          "bidRefundReceived": "150000000000000",
          "totalProtocolFee": "2000000000800"
        }
      },
      "displayAddr": "0x7479...fa6b",
      "holdersRank": 1,
      "pointsShare": 1,
      "totalProtocolFeeRank": 1
    }
  ]
}
```

</details>

### Ad spaces data for an offer

Purpose: Retrieve data to display on sponsors' interfaces.

|Method|Endpoint|Parameters|Cache Tags|
|--|--|--|--|
|`GET`|`/ads/[offerId]`| `tokenIds` (optionnal), `tokenData` (optionnal), `adParameterIds` (optionnal)|[`${chainId}-adOffer-${adOfferId}`]|

<details>

<summary>
 Example
</summary>

- Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/ads/1?tokenData=web3,twitter,staking&adParameterIds=imageURL,linkURL'
```

- Response

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
      "link": "https://app.dsponsor.com/11155111/offer/1/65329693524297118063646238334159138948524025175806621014596919199733788562630?tokenData=web3",
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
        "currencyPriceUSDC": "717709127322",
        "currencyPriceUSDCFormatted": "717709.127322",
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
        "bidPriceStructureUsdcFormatted": {
          "previousBidAmount": "0",
          "previousPricePerToken": "0",
          "minimalBidPerToken": "0.29",
          "minimalBuyoutPerToken": "0.29",
          "newBidPerToken": "0.29",
          "totalBidAmount": "0.29",
          "refundBonusPerToken": "0",
          "refundBonusAmount": "0",
          "refundAmountToPreviousBidder": "0",
          "newPricePerToken": "0.29",
          "newAmount": "0.29",
          "newRefundBonusPerToken": "0.014",
          "newRefundBonusAmount": "0.014",
          "protocolFeeAmount": "0.011",
          "royaltyAmount": "0.02",
          "listerAmount": "0.26"
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
        },
        "buyPriceStructureUsdcFormatted": {
          "buyoutPricePerToken": "0.29",
          "listerBuyAmount": "0.26",
          "royaltiesBuyAmount": "0.02",
          "protocolFeeBuyAmount": "0.011"
        }
      }
    },
    "imageURL-5:1": {
      "state": "BUY_MARKET",
      "data": "http://relayer.dsponsor.com/available-1-1.png"
    },
    "linkURL": {
      "state": "BUY_MARKET",
      "data": "https://app.dsponsor.com/11155111/offer/1/65329693524297118063646238334159138948524025175806621014596919199733788562630?tokenData=web3"
    }
  },
  "101661046026135114031620108954831493212219976668510473490175828180454937635060": {
    "_tokenData": "twitter",
    "_buy": {
      "link": "https://app.dsponsor.com/11155111/offer/1/101661046026135114031620108954831493212219976668510473490175828180454937635060?tokenData=twitter",
      "mint": [
        {
          "currency": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
          "amount": "30000000",
          "currencySymbol": "USDC",
          "currencyDecimals": "6",
          "currencyPriceUSDC": "1000000",
          "currencyPriceUSDCFormatted": "1.0",
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
          },
          "mintPriceStructureUsdcFormatted": {
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
      "data": "http://relayer.dsponsor.com/available-1-1.png"
    },
    "linkURL": {
      "state": "BUY_MINT",
      "data": "https://app.dsponsor.com/11155111/offer/1/101661046026135114031620108954831493212219976668510473490175828180454937635060?tokenData=twitter"
    }
  },
  "64873369441774726751632143071124460964591437972899336413549633584093280026386": {
    "_tokenData": "staking",
    "_buy": {
      "link": "https://app.dsponsor.com/11155111/offer/1/64873369441774726751632143071124460964591437972899336413549633584093280026386?tokenData=staking",
      "mint": null,
      "secondary": null
    },
    "imageURL-5:1": {
      "state": "UNAVAILABLE",
      "data": "http://relayer.dsponsor.com/reserved-1-1.png"
    },
    "linkURL": {
      "state": "UNAVAILABLE",
      "data": "https://app.dsponsor.com/11155111/offer/1/64873369441774726751632143071124460964591437972899336413549633584093280026386?tokenData=staking"
    }
  }
}
```

</details>

### Ads data in CSV format

Purpose: Retrieve data in CSV format. It can be use to display ads on Substack (App & Web only) with Datawrapper integration.

|Method|Endpoint|Parameters|Cache Tags|
|--|--|--|--|
|`GET`|`/ads/[offerId]/csv`| `type` (`grid` or `dynamic`), `tokenIds` (optionnal), `tokenData` (optionnal), `adParameterIds` (optionnal), `includeAvailable` (default : true), `includeReserved` (default: true)|[`${chainId}-adOffer-${adOfferId}`]|

`type` is set to `grid` by default, to get all ads in the CSV result. You can choose `dynamic` to get only one row, with a randomly selected ad.

<details>

<summary>
 Example
</summary>

- Request

```bash
curl 'https://relayer.dsponsor.com/api/11155111/ads/1/csv'
```

- Response

```csv
url
[![img](http://relayer.dsponsor.com/11155111/integrations/1/19282846417023109973927104303702190088093782184937122144233407839061296357653/image?adParameterId=imageURL-5:1&includeAvailable=true&includeReserved=true)](http://relayer.dsponsor.com/11155111/integrations/1/19282846417023109973927104303702190088093782184937122144233407839061296357653/link)
[![img](http://relayer.dsponsor.com/11155111/integrations/1/19659553121249687425880686200724592839616780881788978697077138592067823684728/image?adParameterId=imageURL-5:1&includeAvailable=true&includeReserved=true)](http://relayer.dsponsor.com/11155111/integrations/1/19659553121249687425880686200724592839616780881788978697077138592067823684728/link)
```

</details>

### Graph proxy

Purpose: Relay any GraphQL request to the DSponsor subgraph.

|Method|Endpoint|Parameters|
|--|--|--|
|`GET` or `POST`|`/graph`| `query` (required), `variables` (required), `options` (optionnal)|

The response will be automatically populated with a `_meta` object. `new Date(_meta.block.timestamp * 1000).toJSON()` gives you the last update date for your query.

`options` can be used to:

1. Provide Next.js cache instructions, including tags and revalidation (default: `options.next = { cache: "no-store" }`).

2. Populate the response (default: `options.populate = true`):

- Metadata (if `adOffer --> metadataURL` or  `adOffer --> metadata --> content` is provided and valid)
  - `offer.metadata`
  - `token.metadata`
- Mint price information (if `price --> amount` & `price --> currency` are provided)
  - `price.currencySymbol`
  - `price.currencyDecimals`
  - `price.currencyPriceUSDC`
  - `price.currencyPriceUSDCFormatted`
  - `price.minterAddress`
  - `price.protocolFeeBps`
  - `price.mintPriceStructure`
  - `price.mintPriceStructureFormatted`
  - `price.mintPriceStructureUsdc`
  - `price.mintPriceStructureUsdcFormatted`
- Mint information (if `mint --> totalPaid` & `mint --> currency` are provided)
  - `mint.currencySymbol`
  - `mint.currencyDecimals`
  - `mint.currencyPriceUSDC`
  - `mint.currencyPriceUSDCFormatted`
  - `mint.mintTotalPaidFormatted`
  - `mint.mintTotalPaidUsdc`
  - `mint.mintTotalPaidUsdcFormatted`
- Secondary market information ( if `marketplaceListings --> reservePricePerToken`, `marketplaceListings --> buyoutPricePerToken`,  `marketplaceListings --> currency`, `marketplaceListings --> quantity`, `marketplaceListings --> bids --> totalBidAmount`, `nftContract --> royalty --> bps` are provided)
  - `marketplaceListing.currencySymbol`
  - `marketplaceListing.currencyDecimals`
  - `marketplaceListing.currencyPriceUSDC`
  - `marketplaceListing.currencyPriceUSDCFormatted`
  - `marketplaceListing.marketplaceAddress`
  - `marketplaceListing.protocolFeeBps`
  - `marketplaceListing.minimalBidBps`
  - `marketplaceListing.previousBidAmountBps`
  - `marketplaceListing.bidPriceStructure`
  - `marketplaceListing.bidPriceStructureFormatted`
  - `marketplaceListing.bidPriceStructureUsdc`
  - `marketplaceListing.bidPriceStructureUsdcFormatted`
  - `marketplaceListing.buyPriceStructure`
  - `marketplaceListing.buyPriceStructureFormatted`
  - `marketplaceListing.buyPriceStructureUsdc`
  - `marketplaceListing.buyPriceStructureUsdcFormatted`

You can use [Apollo's Sandbox](https://studio.apollographql.com/sandbox/explorer), with `https://relayer.dsponsor.com/api/11155111/graph` set as the endpoint for example.

<details>

<summary>
 Example
</summary>

- Request

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
              currency
              totalPaid
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
                creationTimestamp
                creationTxHash                
                bidder
                status
                totalBidAmount
                paidBidAmount
                refundProfit
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
      "tokenId": "70622639689279718371527342103894932928233838121221666359043189029713682937432"
    },
    "options": {
     "populate": true,
      "next": {
        "tags": ["11155111-adOffer-1"]
      }
    }
  }'
```

- Response

```json
{
  "data": {
    "adOffers": [
      {
        "id": "1",
        "metadataURL": "https://orange-elegant-swallow-161.mypinata.cloud/ipfs/QmV3RDQLXQa4DWkRz7NA7umjhdVf3gvpJH9NHyfzvooiv9",
        "nftContract": {
          "royalty": {
            "bps": "690",
            "receiver": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766"
          },
          "prices": [
            {
              "currency": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
              "amount": "9000000000000000",
              "enabled": true,
              "currencySymbol": "WETH",
              "currencyDecimals": "18",
              "currencyPriceUSDC": "765200403295",
              "currencyPriceUSDCFormatted": "765.2K",
              "minterAddress": "0x10E0447dDB66f1d33E6b10dB5099FBa231ceCE5C",
              "protocolFeeBps": "400",
              "mintPriceStructure": {
                "creatorAmount": "9000000000000000",
                "protocolFeeAmount": "360000000000000",
                "totalAmount": "9360000000000000"
              },
              "mintPriceStructureFormatted": {
                "creatorAmount": "0.009",
                "protocolFeeAmount": "0.0₃4",
                "totalAmount": "0.009"
              },
              "mintPriceStructureUsdc": {
                "creatorAmount": "6886803629",
                "protocolFeeAmount": "275472145",
                "totalAmount": "7162275774"
              },
              "mintPriceStructureUsdcFormatted": {
                "creatorAmount": "6.9K",
                "protocolFeeAmount": "275.47",
                "totalAmount": "7.2K"
              }
            }
          ],
          "tokens": [
            {
              "tokenId": "70622639689279718371527342103894932928233838121221666359043189029713682937432",
              "mint": {
                "blockTimestamp": "1722329256",
                "tokenData": "test",
                "currency": "0x0000000000000000000000000000000000000000",
                "totalPaid": null
              },
              "prices": [],
              "marketplaceListings": [
                {
                  "id": "81",
                  "quantity": "1",
                  "buyoutPricePerToken": "900000000000000000",
                  "reservePricePerToken": "6000000000000000",
                  "currency": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
                  "bids": [
                    {
                      "creationTimestamp": "1724688444",
                      "creationTxHash": "0xe61b9995f1fa39cc1f048e6b4df5eca3773e598f96d7cb1eb3cfc8c758c0b53e",
                      "bidder": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766",
                      "status": "CREATED",
                      "totalBidAmount": "6300000000000000",
                      "paidBidAmount": "6600000000000000",
                      "refundProfit": "0",
                      "amountsFormatted": {
                        "totalBidAmount": "0.006",
                        "paidBidAmount": "0.007",
                        "refundProfit": "0"
                      }
                    },
                    {
                      "creationTimestamp": "1724433480",
                      "creationTxHash": "0x3d434342dc7c08a257364e8d2ac65b1fbeaee4218575d82efd737dfa76a13811",
                      "bidder": "0x64e8f7c2b4fd33f5e8470f3c6df04974f90fc2ca",
                      "status": "CANCELLED",
                      "totalBidAmount": "6000000000000000",
                      "paidBidAmount": "6000000000000000",
                      "refundProfit": "300000000000000",
                      "amountsFormatted": {
                        "totalBidAmount": "0.006",
                        "paidBidAmount": "0.006",
                        "refundProfit": "0.0₃3"
                      }
                    }
                  ],
                  "token": {
                    "nftContract": {
                      "royalty": {
                        "bps": "690",
                        "receiver": "0x9a7fac267228f536a8f250e65d7c4ca7d39de766"
                      },
                      "allowList": false
                    }
                  },
                  "currencySymbol": "WETH",
                  "currencyDecimals": "18",
                  "currencyPriceUSDC": "765200403295",
                  "currencyPriceUSDCFormatted": "765.2K",
                  "marketplaceAddress": "0x0B7f100940f4152D01B42A626ab73f7A62dd7cdC",
                  "protocolFeeBps": "400",
                  "minimalBidBps": "1000",
                  "previousBidAmountBps": "500",
                  "bidPriceStructure": {
                    "previousBidAmount": "6300000000000000",
                    "previousPricePerToken": "6300000000000000",
                    "minimalBidPerToken": "6930000000000000",
                    "minimalBuyoutPerToken": "900315000000000000",
                    "newBidPerToken": "6930000000000000",
                    "totalBidAmount": "6930000000000000",
                    "refundBonusPerToken": "315000000000000",
                    "refundBonusAmount": "315000000000000",
                    "refundAmountToPreviousBidder": "6615000000000000",
                    "newPricePerToken": "6615000000000000",
                    "newAmount": "6615000000000000",
                    "newRefundBonusPerToken": "330750000000000",
                    "newRefundBonusAmount": "330750000000000",
                    "newRefundAmount": "6945750000000000",
                    "newProfitAmount": "15750000000000",
                    "protocolFeeAmount": "264600000000000",
                    "royaltyAmount": "456435000000000",
                    "listerAmount": "5893965000000000"
                  },
                  "bidPriceStructureFormatted": {
                    "previousBidAmount": "0.006",
                    "previousPricePerToken": "0.006",
                    "minimalBidPerToken": "0.007",
                    "minimalBuyoutPerToken": "0.9",
                    "newBidPerToken": "0.007",
                    "totalBidAmount": "0.007",
                    "refundBonusPerToken": "0.0₃3",
                    "refundBonusAmount": "0.0₃3",
                    "refundAmountToPreviousBidder": "0.007",
                    "newPricePerToken": "0.007",
                    "newAmount": "0.007",
                    "newRefundBonusPerToken": "0.0₃3",
                    "newRefundBonusAmount": "0.0₃3",
                    "newRefundAmount": "0.007",
                    "newProfitAmount": "0.0₄1",
                    "protocolFeeAmount": "0.0₃3",
                    "royaltyAmount": "0.0₃4",
                    "listerAmount": "0.006"
                  },
                  "bidPriceStructureUsdc": {
                    "previousBidAmount": "4820762540",
                    "previousPricePerToken": "4820762540",
                    "minimalBidPerToken": "5302838794",
                    "minimalBuyoutPerToken": "688921401092",
                    "newBidPerToken": "5302838794",
                    "totalBidAmount": "5302838794",
                    "refundBonusPerToken": "241038127",
                    "refundBonusAmount": "241038127",
                    "refundAmountToPreviousBidder": "5061800667",
                    "newPricePerToken": "5061800667",
                    "newAmount": "5061800667",
                    "newRefundBonusPerToken": "253090033",
                    "newRefundBonusAmount": "253090033",
                    "newRefundAmount": "5314890701",
                    "newProfitAmount": "12051906",
                    "protocolFeeAmount": "202472026",
                    "royaltyAmount": "349264246",
                    "listerAmount": "4510064395"
                  },
                  "bidPriceStructureUsdcFormatted": {
                    "previousBidAmount": "4.8K",
                    "previousPricePerToken": "4.8K",
                    "minimalBidPerToken": "5.3K",
                    "minimalBuyoutPerToken": "688.9K",
                    "newBidPerToken": "5.3K",
                    "totalBidAmount": "5.3K",
                    "refundBonusPerToken": "241.04",
                    "refundBonusAmount": "241.04",
                    "refundAmountToPreviousBidder": "5.1K",
                    "newPricePerToken": "5.1K",
                    "newAmount": "5.1K",
                    "newRefundBonusPerToken": "253.09",
                    "newRefundBonusAmount": "253.09",
                    "newRefundAmount": "5.3K",
                    "newProfitAmount": "12.05",
                    "protocolFeeAmount": "202.47",
                    "royaltyAmount": "349.26",
                    "listerAmount": "4.5K"
                  },
                  "buyPriceStructure": {
                    "buyoutPricePerToken": "900000000000000000",
                    "listerBuyAmount": "801900000000000000",
                    "royaltiesBuyAmount": "62100000000000000",
                    "protocolFeeBuyAmount": "36000000000000000"
                  },
                  "buyPriceStructureUsdc": {
                    "buyoutPricePerToken": "688680362965",
                    "listerBuyAmount": "613614203402",
                    "royaltiesBuyAmount": "47518945044",
                    "protocolFeeBuyAmount": "27547214518"
                  },
                  "buyPriceStructureFormatted": {
                    "buyoutPricePerToken": "0.9",
                    "listerBuyAmount": "0.8",
                    "royaltiesBuyAmount": "0.062",
                    "protocolFeeBuyAmount": "0.036"
                  },
                  "buyPriceStructureUsdcFormatted": {
                    "buyoutPricePerToken": "688.7K",
                    "listerBuyAmount": "613.6K",
                    "royaltiesBuyAmount": "47.5K",
                    "protocolFeeBuyAmount": "27.5K"
                  }
                }
              ],
              "metadata": {
                "name": "#test - SiBorg App",
                "description": "Buying this ad space means you own a parcel on SiBorg app. It grants you the exclusive right to submit an ad to be displayed when any user searches for 'test' and benefits from SiBorg visibility. You are free to change the ad proposal at any time and free to resell it on the open market enabling you to invest in the future visibility of the platform.",
                "image": "https://relayer.dsponsor.com/api/images?text=test",
                "terms": "https://docs.google.com/document/d/12_uch6guEm4tPuWQ3CVJr7FmHRZczoJLkm5CJsuXyyM",
                "external_link": "https://app.dsponsor.com/8453/offer/1",
                "external_url": "https://app.dsponsor.com/8453/offer/1",
                "valid_from": "2024-07-01T06:00:00Z",
                "valid_to": "2025-06-30T21:00:00Z",
                "categories": [
                  "Community",
                  "NFT",
                  "Crypto"
                ],
                "token_metadata": {
                  "name": "#{tokenData} - SiBorg App",
                  "description": "Buying this ad space means you own a parcel on SiBorg app. It grants you the exclusive right to submit an ad to be displayed when any user searches for '{tokenData}' and benefits from SiBorg visibility. You are free to change the ad proposal at any time and free to resell it on the open market enabling you to invest in the future visibility of the platform.",
                  "image": "https://relayer.dsponsor.com/api/images?text={tokenData}",
                  "attributes": [
                    {
                      "trait_type": "Search Query",
                      "value": "{tokenData}"
                    }
                  ]
                },
                "attributes": [
                  {
                    "trait_type": "Search Query",
                    "value": "test"
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
            "image": "https://orange-elegant-swallow-161.mypinata.cloud/ipfs/QmeVJy5wXJhcNy4dynGj31HLwqk8Z1s8UvbJMY8iAaxUar",
            "external_link": "https://siborg.io",
            "external_url": "https://siborg.io",
            "categories": [
              "dApp",
              "social",
              "media",
              "education"
            ]
          },
          "offer": {
            "name": "SiBorg Ads",
            "description": "SiBorg is a podcast application for Twitter Spaces that leverages Web3 Social interactions. The SiBorg app is composed of parcels, each parcel linked to a query ticker that can be used in our search bar. SiBorg Ad Spaces owners can customize their ad space and benefit from the visibility associated with the platform.",
            "image": "https://orange-elegant-swallow-161.mypinata.cloud/ipfs/QmdBodpqyrH6M8mYFrQNdokZMZArPfvY2cKoeHXKiSb4RQ",
            "terms": "https://docs.google.com/document/d/12_uch6guEm4tPuWQ3CVJr7FmHRZczoJLkm5CJsuXyyM",
            "external_link": "https://app.dsponsor.com/8453/offer/1",
            "external_url": "https://app.dsponsor.com/8453/offer/1",
            "valid_from": "2024-07-01T06:00:00Z",
            "valid_to": "2025-06-30T21:00:00Z",
            "categories": [
              "Community",
              "NFT",
              "Crypto"
            ],
            "token_metadata": {
              "name": "#{tokenData} - SiBorg App",
              "description": "Buying this ad space means you own a parcel on SiBorg app. It grants you the exclusive right to submit an ad to be displayed when any user searches for '{tokenData}' and benefits from SiBorg visibility. You are free to change the ad proposal at any time and free to resell it on the open market enabling you to invest in the future visibility of the platform.",
              "image": "https://relayer.dsponsor.com/api/images?text={tokenData}",
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
    ],
    "_meta": {
      "block": {
        "timestamp": 1725289716
      }
    }
  }
}
```

</details>

### Price quote

Purpose: When paying by credit card or through a frame, only native payments are possible. To mint, bid, or buy ad space tokens billed in another currency, a swap from ETH to the desired currency is performed by DSponsor smart contracts. This route provides all the necessary information to complete a purchase with ETH.

1. Retrieves USD and ETH prices for a specific token. Data is fetched from Uniswap quoter.
  
2. Uses [Shield3](https://www.shield3.com/) to check security and compliance policies. It verifies if the recipient and token smart contract are not on the OFAC addresses list. It also checks if the transaction involves more than 1 ETH. Slippage threshold detection will be added later.

|Method|Endpoint|Parameters|Cache tags|
|--|--|--|--|
|`GET`|`/prices`|`token` (required), `amount` (required), `splippage` (optionnal), `recipient` (optionnal), `check` (optionnal)|['cron'](revalidated every 5 minutes)|

<details>

<summary>
 Simple example: 0.00002 UNI, 0.3% slippage
</summary>

```bash
curl 'https://relayer.dsponsor.com/api/11155111/prices?token=0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984&amount=20000000000000&slippage=0.3'
```

```json
{
  "amountInEth": "111748006458193",
  "amountInEthWithSlippage": "112083250477567",
  "amountUSDC": "86634487",
  "amountInEthFormatted": "0.0₃1",
  "amountInEthWithSlippageFormatted": "0.0₃1",
  "amountUSDCFormatted": "86.63",
  "shield3Decisions": []
}
```

</details>

<details>

<summary>
 Shield3 block decision - Native value thresold : 10 WETH (> 1 ETH)
</summary>

```bash
curl 'https://relayer.dsponsor.com/api/8453/prices?token=0x4200000000000000000000000000000000000006&amount=10000000000000000000&slippage=0.3&check=shield3'
```

```json
{
  "amountInEth": "10000000000000000000",
  "amountInEthWithSlippage": "10000000000000000000",
  "amountUSDC": "32469295336",
  "amountInEthFormatted": "10",
  "amountInEthWithSlippageFormatted": "10",
  "amountUSDCFormatted": "32.5K",
  "shield3Decisions": [
    {
      "policyId": "802ca990-23cf-4436-be76-9fc0fa0ed7b0",
      "name": "OFAC SDN block native and ERC20 transactions",
      "description": "Block native transfers, ERC20 transfers, and ERC20 approvals to OFAC addresses",
      "policyIcon": "block",
      "icon": "check",
      "label": "OFAC SANCTION",
      "severity": 1,
      "entryType": "reason",
      "decision": "Allow"
    },
    {
      "policyId": "f3e79f77-b531-4fef-9ac7-1f22f7b8a309",
      "name": "Native value thresholds",
      "description": "Block native value transactions over a certain threshold, and require MFA for transactions over a lower threshold",
      "policyIcon": "bell",
      "icon": "block",
      "label": "TRANSACTION THRESHOLD",
      "severity": 0,
      "entryType": "reason",
      "decision": "Block"
    }
  ]
}
```

</details>

<details>

<summary>
 Shield3 block decision - Ronin Bridge Exploiter (0x098b716b8aaf21512996dc57eb0615e2383e2f96) is recipient
</summary>

```bash
curl 'https://relayer.dsponsor.com/api/8453/prices?token=0x4200000000000000000000000000000000000006&amount=1000000000&slippage=0.3&recipient=0x098b716b8aaf21512996dc57eb0615e2383e2f96&check=shield3'
```

```json
{
  "amountInEth": "1000000000",
  "amountInEthWithSlippage": "1000000000",
  "amountUSDC": "3",
  "amountInEthFormatted": "0.0₈1",
  "amountInEthWithSlippageFormatted": "0.0₈1",
  "amountUSDCFormatted": "0.0₅3",
  "shield3Decisions": [
    {
      "policyId": "802ca990-23cf-4436-be76-9fc0fa0ed7b0",
      "name": "OFAC SDN block native and ERC20 transactions",
      "description": "Block native transfers, ERC20 transfers, and ERC20 approvals to OFAC addresses",
      "policyIcon": "block",
      "icon": "block",
      "label": "OFAC SANCTION",
      "severity": 0,
      "entryType": "reason",
      "decision": "Block"
    },
    {
      "policyId": "f3e79f77-b531-4fef-9ac7-1f22f7b8a309",
      "name": "Native value thresholds",
      "description": "Block native value transactions over a certain threshold, and require MFA for transactions over a lower threshold",
      "policyIcon": "bell",
      "icon": "check",
      "label": "TRANSACTION THRESHOLD",
      "severity": 1,
      "entryType": "reason",
      "decision": "Allow"
    }
  ]
}
```

</details>

### Token metadata

Purpose: Retrieve token metadata according to the official ERC721 metadata standard.

|Method|Endpoint|Parameters|Cache Tags|
|--|--|--|--|
|`GET`|`/tokenMetadata/[nftContractAddress]/[tokenId]`||[`${chainId}-nftContract-${nftContractAddress}`]|

<details>

<summary>
 Example
</summary>

- Request

```bash
curl 'https://relayer.dsponsor.com/api/8453/tokenMetadata/0x141fec749536067fe4b9291fb00a8a398023c7c9/114978956394214466574350984893002737044955096044182110066771590950350869641321'
```

- Response

```json
{
  "name": "#Borg - SiBorg App",
  "description": "Buying this ad space means you own a parcel on SiBorg app. It grants you the exclusive right to submit an ad to be displayed when any user searches for 'Borg' and benefits from SiBorg visibility. You are free to change the ad proposal at any time and free to resell it on the secondary market enabling you to invest in the future visibility of the platform.",
  "image": "https://relayer.dsponsor.com/api/images?text=Borg",
  "terms": "https://docs.google.com/document/d/15um5c6mMoKc8V1rVyRJ7tcIxFDmtE8xe75mx-CdB84w",
  "external_link": "https://app.dsponsor.com/8453/offer/1",
  "external_url": "https://app.dsponsor.com/8453/offer/1",
  "valid_from": "2024-08-01T06:00:00Z",
  "valid_to": "2025-07-31T21:00:00Z",
  "categories": [
    "Community",
    "NFT",
    "Crypto"
  ],
  "token_metadata": {
    "name": "#{tokenData} - SiBorg App",
    "description": "Buying this ad space means you own a parcel on SiBorg app. It grants you the exclusive right to submit an ad to be displayed when any user searches for '{tokenData}' and benefits from SiBorg visibility. You are free to change the ad proposal at any time and free to resell it on the secondary market enabling you to invest in the future visibility of the platform.",
    "image": "https://relayer.dsponsor.com/api/images?text={tokenData}",
    "attributes": [
      {
        "trait_type": "Search Query",
        "value": "{tokenData}"
      }
    ]
  },
  "attributes": [
    {
      "trait_type": "Search Query",
      "value": "Borg"
    }
  ]
}
```

- Result on [Opensea](https://opensea.io/assets/base/0x141fec749536067fe4b9291fb00a8a398023c7c9/114978956394214466574350984893002737044955096044182110066771590950350869641321):

![opensea-dsponsor](./public/opensea-example.png)

</details>

### Ad offer data related to user

Purpose: Retrieve ad offers where the user holds tokens, has placed bids, or serves as an admin/validator.

|Method|Endpoint|Parameters|Cache Tags|
|--|--|--|--|
|`GET`|`/account/[userAddress]`||[`${chainId}-userAddress-${userAddress}`]|

<details>

<summary>
 Example
</summary>

- Request

```bash
curl 'https://relayer.dsponsor.com/api/8453/account/0xbE28b1155c9552d9F0c2C861dd423480CA0A21e6'
```

- Response

```json
{
  "data": {
    "adOffers": [
      {
        "id": "2",
        "disable": false,
        "metadataURL": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeibd2htca4idfaahe7zkhkqpf7otc3pkl7q7lh4qp77i362umb7iwu/0",
        "name": "Daily newsletter",
        "initialCreator": "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35",
        "validators": null,
        "admins": [
          "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35"
        ],
        "creationTimestamp": "1725655321",
        "adParameters": [
          {
            "enable": true,
            "adParameter": {
              "id": "imageURL-16:9",
              "base": "imageURL",
              "variants": [
                "16:9"
              ]
            }
          },
          {
            "enable": true,
            "adParameter": {
              "id": "linkURL",
              "base": "linkURL",
              "variants": []
            }
          }
        ],
        "nftContract": {
          "id": "0x69bbb21231b8c233fa35fc7c60968746b972517a",
          "allowList": true,
          "maxSupply": "4",
          "owner": null,
          "prices": [
            {
              "enabled": true,
              "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
              "amount": "250000000",
              "currencySymbol": "USDC",
              "currencyDecimals": "6",
              "currencyPriceUSDC": "1000000",
              "currencyPriceUSDCFormatted": "1",
              "minterAddress": "0xC6cCe35375883872826DdF3C30557F16Ec4DD94c",
              "protocolFeeBps": "400",
              "mintPriceStructure": {
                "creatorAmount": "250000000",
                "protocolFeeAmount": "10000000",
                "totalAmount": "260000000"
              },
              "mintPriceStructureFormatted": {
                "creatorAmount": "250",
                "protocolFeeAmount": "10",
                "totalAmount": "260"
              },
              "mintPriceStructureUsdc": {
                "creatorAmount": "250000000",
                "protocolFeeAmount": "10000000",
                "totalAmount": "260000000"
              },
              "mintPriceStructureUsdcFormatted": {
                "creatorAmount": "250",
                "protocolFeeAmount": "10",
                "totalAmount": "260"
              }
            }
          ],
          "royalty": {
            "bps": "1000",
            "receiver": "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35"
          },
          "tokens": [
            {
              "tokenId": "0",
              "setInAllowList": true,
              "owner": "0xe548d1e1d11aa22fb5dd7b8faa8e758e6bc8ec6a",
              "marketplaceListings": [],
              "nftContract": {
                "id": "0x69bbb21231b8c233fa35fc7c60968746b972517a",
                "allowList": true,
                "maxSupply": "4",
                "owner": null,
                "prices": [
                  {
                    "enabled": true,
                    "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                    "amount": "250000000",
                    "currencySymbol": "USDC",
                    "currencyDecimals": "6",
                    "currencyPriceUSDC": "1000000",
                    "currencyPriceUSDCFormatted": "1",
                    "minterAddress": "0xC6cCe35375883872826DdF3C30557F16Ec4DD94c",
                    "protocolFeeBps": "400",
                    "mintPriceStructure": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    },
                    "mintPriceStructureUsdc": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureUsdcFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    }
                  }
                ],
                "royalty": {
                  "bps": "1000",
                  "receiver": "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35"
                }
              },
              "mint": {
                "tokenData": "",
                "blockTimestamp": "1726136757",
                "totalPaid": "260000000",
                "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                "currencySymbol": "USDC",
                "currencyDecimals": "6",
                "currencyPriceUSDC": "1000000",
                "currencyPriceUSDCFormatted": "1",
                "mintTotalPaidFormatted": {
                  "totalPaid": "260"
                },
                "mintTotalPaidUsdc": {
                  "totalPaid": "260000000"
                },
                "mintTotalPaidUsdcFormatted": {
                  "totalPaid": "260"
                }
              },
              "prices": [],
              "currentProposals": [
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeieqvyohbyfk5ifze47ckibsc75gkgbnj456l2ho6hl7jk6pbydwu4/",
                    "creationTimestamp": "1726754787"
                  },
                  "rejectedProposal": {
                    "status": "CURRENT_REJECTED",
                    "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeif2dfkzhwc27i5ldlcrodx66tgial2eajrnuv27o5pnc7ziwhkymu/",
                    "rejectReason": "Poids trop élevé",
                    "creationTimestamp": "1726654201"
                  }
                },
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://tally.so/r/3EDMoX",
                    "creationTimestamp": "1726754787"
                  },
                  "rejectedProposal": {
                    "status": "CURRENT_REJECTED",
                    "data": "https://linktr.ee/fundera",
                    "rejectReason": "Poids trop élevé",
                    "creationTimestamp": "1726654201"
                  }
                }
              ],
              "allProposals": [
                {
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://tally.so/r/3EDMoX",
                  "rejectReason": null,
                  "creationTimestamp": "1726754787",
                  "lastUpdateTimestamp": "1726826769"
                },
                {
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeieqvyohbyfk5ifze47ckibsc75gkgbnj456l2ho6hl7jk6pbydwu4/",
                  "rejectReason": null,
                  "creationTimestamp": "1726754787",
                  "lastUpdateTimestamp": "1726826769"
                },
                {
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "status": "CURRENT_REJECTED",
                  "data": "https://linktr.ee/fundera",
                  "rejectReason": "Poids trop élevé",
                  "creationTimestamp": "1726654201",
                  "lastUpdateTimestamp": "1726751667"
                },
                {
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "status": "CURRENT_REJECTED",
                  "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeif2dfkzhwc27i5ldlcrodx66tgial2eajrnuv27o5pnc7ziwhkymu/",
                  "rejectReason": "Poids trop élevé",
                  "creationTimestamp": "1726654201",
                  "lastUpdateTimestamp": "1726751667"
                },
                {
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "status": "PREV_ACCEPTED",
                  "data": "https://linktr.ee/fundera",
                  "rejectReason": null,
                  "creationTimestamp": "1726514177",
                  "lastUpdateTimestamp": "1726826769"
                },
                {
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "status": "PREV_ACCEPTED",
                  "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeifoe4oj3f4nnsurbjyrlmkwfi5zjdbsn6pzkyy57zjsmld3cwyavm/",
                  "rejectReason": null,
                  "creationTimestamp": "1726514177",
                  "lastUpdateTimestamp": "1726826769"
                }
              ],
              "metadata": {
                "name": "Daily newsletter",
                "description": "One token equals one slot at the top of our daily newsletter.\nCryptoast delivers a newsletter 5 times a week, featuring the latest articles published on our website.\n\nThe newsletter is distributed to 5,000 e-mail addresses as of September 6, 2024.\nThe newsletter has an average open rate of 20%.\nThe click-through rate is 2% on average.\nEach month, 100,000 e-mails are sent, with 20,000 opened.\n\nHere is the evolution of the number of subscribers to our daily newsletter: \nJuly 6: 2,000 emails\nAugust 6: 3,700 emails -> +85% of subscribers\nSeptember 6: 5,000 emails -> +35% of subscribers",
                "image": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeihnhkwkgvn6z3wcfhvn3aghrvtjshubjqy22gn5tfned4okhx26ka/",
                "terms": "https://docs.google.com/document/d/1MeMC1pQ7_EwScSEbDHiyhCB2PafSTwvt-P4o1uQ26I4/edit?usp=sharing",
                "external_link": "Daily newsletter",
                "valid_from": "2024-09-17T22:00:00.000Z",
                "valid_to": "2024-10-17T22:00:00.000Z",
                "categories": [
                  "Community",
                  "NFT",
                  "Crypto"
                ],
                "token_metadata": {}
              }
            },
            {
              "tokenId": "1",
              "setInAllowList": true,
              "owner": "0x2274029ff1a529645594badbbbc276f07513f283",
              "marketplaceListings": [
                {
                  "id": "175",
                  "lister": "0x2274029ff1a529645594badbbbc276f07513f283",
                  "quantity": "1",
                  "listingType": "Direct",
                  "startTime": "1727200009",
                  "endTime": "1728582396",
                  "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                  "buyoutPricePerToken": "265000000",
                  "reservePricePerToken": "265000000",
                  "status": "CREATED",
                  "bids": [],
                  "currencySymbol": "USDC",
                  "currencyDecimals": "6",
                  "currencyPriceUSDC": "1000000",
                  "currencyPriceUSDCFormatted": "1",
                  "marketplaceAddress": "0x86aDf604B5B72d270654F3A0798cabeBC677C7fc",
                  "protocolFeeBps": "400",
                  "minimalBidBps": "1000",
                  "previousBidAmountBps": "500",
                  "bidPriceStructure": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "265000000",
                    "minimalBuyoutPerToken": "265000000",
                    "newBidPerToken": "265000000",
                    "totalBidAmount": "265000000",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "265000000",
                    "newAmount": "265000000",
                    "newRefundBonusPerToken": "13250000",
                    "newRefundBonusAmount": "13250000",
                    "newRefundAmount": "278250000",
                    "newProfitAmount": "13250000",
                    "protocolFeeAmount": "10600000",
                    "royaltyAmount": "26500000",
                    "listerAmount": "227900000"
                  },
                  "bidPriceStructureFormatted": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "265",
                    "minimalBuyoutPerToken": "265",
                    "newBidPerToken": "265",
                    "totalBidAmount": "265",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "265",
                    "newAmount": "265",
                    "newRefundBonusPerToken": "13.25",
                    "newRefundBonusAmount": "13.25",
                    "newRefundAmount": "278.25",
                    "newProfitAmount": "13.25",
                    "protocolFeeAmount": "10.6",
                    "royaltyAmount": "26.5",
                    "listerAmount": "227.9"
                  },
                  "bidPriceStructureUsdc": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "265000000",
                    "minimalBuyoutPerToken": "265000000",
                    "newBidPerToken": "265000000",
                    "totalBidAmount": "265000000",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "265000000",
                    "newAmount": "265000000",
                    "newRefundBonusPerToken": "13250000",
                    "newRefundBonusAmount": "13250000",
                    "newRefundAmount": "278250000",
                    "newProfitAmount": "13250000",
                    "protocolFeeAmount": "10600000",
                    "royaltyAmount": "26500000",
                    "listerAmount": "227900000"
                  },
                  "bidPriceStructureUsdcFormatted": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "265",
                    "minimalBuyoutPerToken": "265",
                    "newBidPerToken": "265",
                    "totalBidAmount": "265",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "265",
                    "newAmount": "265",
                    "newRefundBonusPerToken": "13.25",
                    "newRefundBonusAmount": "13.25",
                    "newRefundAmount": "278.25",
                    "newProfitAmount": "13.25",
                    "protocolFeeAmount": "10.6",
                    "royaltyAmount": "26.5",
                    "listerAmount": "227.9"
                  },
                  "buyPriceStructure": {
                    "buyoutPricePerToken": "265000000",
                    "listerBuyAmount": "227900000",
                    "royaltiesBuyAmount": "26500000",
                    "protocolFeeBuyAmount": "10600000"
                  },
                  "buyPriceStructureUsdc": {
                    "buyoutPricePerToken": "265000000",
                    "listerBuyAmount": "227900000",
                    "royaltiesBuyAmount": "26500000",
                    "protocolFeeBuyAmount": "10600000"
                  },
                  "buyPriceStructureFormatted": {
                    "buyoutPricePerToken": "265",
                    "listerBuyAmount": "227.9",
                    "royaltiesBuyAmount": "26.5",
                    "protocolFeeBuyAmount": "10.6"
                  },
                  "buyPriceStructureUsdcFormatted": {
                    "buyoutPricePerToken": "265",
                    "listerBuyAmount": "227.9",
                    "royaltiesBuyAmount": "26.5",
                    "protocolFeeBuyAmount": "10.6"
                  }
                },
                {
                  "id": "174",
                  "lister": "0x2274029ff1a529645594badbbbc276f07513f283",
                  "quantity": "1",
                  "listingType": "Direct",
                  "startTime": "1726571541",
                  "endTime": "1727176331",
                  "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                  "buyoutPricePerToken": "275000000",
                  "reservePricePerToken": "275000000",
                  "status": "CANCELLED",
                  "bids": [],
                  "currencySymbol": "USDC",
                  "currencyDecimals": "6",
                  "currencyPriceUSDC": "1000000",
                  "currencyPriceUSDCFormatted": "1",
                  "marketplaceAddress": "0x86aDf604B5B72d270654F3A0798cabeBC677C7fc",
                  "protocolFeeBps": "400",
                  "minimalBidBps": "1000",
                  "previousBidAmountBps": "500",
                  "bidPriceStructure": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "275000000",
                    "minimalBuyoutPerToken": "275000000",
                    "newBidPerToken": "275000000",
                    "totalBidAmount": "275000000",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "275000000",
                    "newAmount": "275000000",
                    "newRefundBonusPerToken": "13750000",
                    "newRefundBonusAmount": "13750000",
                    "newRefundAmount": "288750000",
                    "newProfitAmount": "13750000",
                    "protocolFeeAmount": "11000000",
                    "royaltyAmount": "27500000",
                    "listerAmount": "236500000"
                  },
                  "bidPriceStructureFormatted": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "275",
                    "minimalBuyoutPerToken": "275",
                    "newBidPerToken": "275",
                    "totalBidAmount": "275",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "275",
                    "newAmount": "275",
                    "newRefundBonusPerToken": "13.75",
                    "newRefundBonusAmount": "13.75",
                    "newRefundAmount": "288.75",
                    "newProfitAmount": "13.75",
                    "protocolFeeAmount": "11",
                    "royaltyAmount": "27.5",
                    "listerAmount": "236.5"
                  },
                  "bidPriceStructureUsdc": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "275000000",
                    "minimalBuyoutPerToken": "275000000",
                    "newBidPerToken": "275000000",
                    "totalBidAmount": "275000000",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "275000000",
                    "newAmount": "275000000",
                    "newRefundBonusPerToken": "13750000",
                    "newRefundBonusAmount": "13750000",
                    "newRefundAmount": "288750000",
                    "newProfitAmount": "13750000",
                    "protocolFeeAmount": "11000000",
                    "royaltyAmount": "27500000",
                    "listerAmount": "236500000"
                  },
                  "bidPriceStructureUsdcFormatted": {
                    "previousBidAmount": "0",
                    "previousPricePerToken": "0",
                    "minimalBidPerToken": "275",
                    "minimalBuyoutPerToken": "275",
                    "newBidPerToken": "275",
                    "totalBidAmount": "275",
                    "refundBonusPerToken": "0",
                    "refundBonusAmount": "0",
                    "refundAmountToPreviousBidder": "0",
                    "newPricePerToken": "275",
                    "newAmount": "275",
                    "newRefundBonusPerToken": "13.75",
                    "newRefundBonusAmount": "13.75",
                    "newRefundAmount": "288.75",
                    "newProfitAmount": "13.75",
                    "protocolFeeAmount": "11",
                    "royaltyAmount": "27.5",
                    "listerAmount": "236.5"
                  },
                  "buyPriceStructure": {
                    "buyoutPricePerToken": "275000000",
                    "listerBuyAmount": "236500000",
                    "royaltiesBuyAmount": "27500000",
                    "protocolFeeBuyAmount": "11000000"
                  },
                  "buyPriceStructureUsdc": {
                    "buyoutPricePerToken": "275000000",
                    "listerBuyAmount": "236500000",
                    "royaltiesBuyAmount": "27500000",
                    "protocolFeeBuyAmount": "11000000"
                  },
                  "buyPriceStructureFormatted": {
                    "buyoutPricePerToken": "275",
                    "listerBuyAmount": "236.5",
                    "royaltiesBuyAmount": "27.5",
                    "protocolFeeBuyAmount": "11"
                  },
                  "buyPriceStructureUsdcFormatted": {
                    "buyoutPricePerToken": "275",
                    "listerBuyAmount": "236.5",
                    "royaltiesBuyAmount": "27.5",
                    "protocolFeeBuyAmount": "11"
                  }
                },
                {
                  "id": "173",
                  "lister": "0x1915fd19e19858f815c924df8d2d6e7065f1e547",
                  "quantity": "1",
                  "listingType": "Auction",
                  "startTime": "1726214887",
                  "endTime": "1726473674",
                  "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                  "buyoutPricePerToken": "400000000",
                  "reservePricePerToken": "260000000",
                  "status": "COMPLETED",
                  "bids": [
                    {
                      "amountSentToCreator": "26000000",
                      "creatorRecipient": "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35",
                      "amountSentToProtocol": "10400000",
                      "amountSentToSeller": "223600000",
                      "sellerRecipient": "0x1915fd19e19858f815c924df8d2d6e7065f1e547",
                      "creationTxHash": "0x0a1845ec8b20510b14ff7244bc45c733859cd4b7ea75ced922ebb79ef7576726",
                      "creationTimestamp": "1726394621",
                      "bidder": "0x2274029ff1a529645594badbbbc276f07513f283",
                      "totalBidAmount": "260000000",
                      "paidBidAmount": "260000000",
                      "refundBonus": "0",
                      "refundAmount": "0",
                      "refundProfit": "0",
                      "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                      "status": "COMPLETED",
                      "amountsFormatted": {
                        "totalBidAmount": "260",
                        "paidBidAmount": "260",
                        "refundBonus": "0",
                        "refundAmount": "0",
                        "refundProfit": "0"
                      }
                    }
                  ],
                  "currencySymbol": "USDC",
                  "currencyDecimals": "6",
                  "currencyPriceUSDC": "1000000",
                  "currencyPriceUSDCFormatted": "1",
                  "marketplaceAddress": "0x86aDf604B5B72d270654F3A0798cabeBC677C7fc",
                  "protocolFeeBps": "400",
                  "minimalBidBps": "1000",
                  "previousBidAmountBps": "500",
                  "bidPriceStructure": {
                    "previousBidAmount": "260000000",
                    "previousPricePerToken": "260000000",
                    "minimalBidPerToken": "286000000",
                    "minimalBuyoutPerToken": "413000000",
                    "newBidPerToken": "286000000",
                    "totalBidAmount": "286000000",
                    "refundBonusPerToken": "13000000",
                    "refundBonusAmount": "13000000",
                    "refundAmountToPreviousBidder": "273000000",
                    "newPricePerToken": "273000000",
                    "newAmount": "273000000",
                    "newRefundBonusPerToken": "13650000",
                    "newRefundBonusAmount": "13650000",
                    "newRefundAmount": "286650000",
                    "newProfitAmount": "650000",
                    "protocolFeeAmount": "10920000",
                    "royaltyAmount": "27300000",
                    "listerAmount": "234780000"
                  },
                  "bidPriceStructureFormatted": {
                    "previousBidAmount": "260",
                    "previousPricePerToken": "260",
                    "minimalBidPerToken": "286",
                    "minimalBuyoutPerToken": "413",
                    "newBidPerToken": "286",
                    "totalBidAmount": "286",
                    "refundBonusPerToken": "13",
                    "refundBonusAmount": "13",
                    "refundAmountToPreviousBidder": "273",
                    "newPricePerToken": "273",
                    "newAmount": "273",
                    "newRefundBonusPerToken": "13.65",
                    "newRefundBonusAmount": "13.65",
                    "newRefundAmount": "286.65",
                    "newProfitAmount": "0.65",
                    "protocolFeeAmount": "10.92",
                    "royaltyAmount": "27.3",
                    "listerAmount": "234.78"
                  },
                  "bidPriceStructureUsdc": {
                    "previousBidAmount": "260000000",
                    "previousPricePerToken": "260000000",
                    "minimalBidPerToken": "286000000",
                    "minimalBuyoutPerToken": "413000000",
                    "newBidPerToken": "286000000",
                    "totalBidAmount": "286000000",
                    "refundBonusPerToken": "13000000",
                    "refundBonusAmount": "13000000",
                    "refundAmountToPreviousBidder": "273000000",
                    "newPricePerToken": "273000000",
                    "newAmount": "273000000",
                    "newRefundBonusPerToken": "13650000",
                    "newRefundBonusAmount": "13650000",
                    "newRefundAmount": "286650000",
                    "newProfitAmount": "650000",
                    "protocolFeeAmount": "10920000",
                    "royaltyAmount": "27300000",
                    "listerAmount": "234780000"
                  },
                  "bidPriceStructureUsdcFormatted": {
                    "previousBidAmount": "260",
                    "previousPricePerToken": "260",
                    "minimalBidPerToken": "286",
                    "minimalBuyoutPerToken": "413",
                    "newBidPerToken": "286",
                    "totalBidAmount": "286",
                    "refundBonusPerToken": "13",
                    "refundBonusAmount": "13",
                    "refundAmountToPreviousBidder": "273",
                    "newPricePerToken": "273",
                    "newAmount": "273",
                    "newRefundBonusPerToken": "13.65",
                    "newRefundBonusAmount": "13.65",
                    "newRefundAmount": "286.65",
                    "newProfitAmount": "0.65",
                    "protocolFeeAmount": "10.92",
                    "royaltyAmount": "27.3",
                    "listerAmount": "234.78"
                  },
                  "buyPriceStructure": {
                    "buyoutPricePerToken": "400000000",
                    "listerBuyAmount": "344000000",
                    "royaltiesBuyAmount": "40000000",
                    "protocolFeeBuyAmount": "16000000"
                  },
                  "buyPriceStructureUsdc": {
                    "buyoutPricePerToken": "400000000",
                    "listerBuyAmount": "344000000",
                    "royaltiesBuyAmount": "40000000",
                    "protocolFeeBuyAmount": "16000000"
                  },
                  "buyPriceStructureFormatted": {
                    "buyoutPricePerToken": "400",
                    "listerBuyAmount": "344",
                    "royaltiesBuyAmount": "40",
                    "protocolFeeBuyAmount": "16"
                  },
                  "buyPriceStructureUsdcFormatted": {
                    "buyoutPricePerToken": "400",
                    "listerBuyAmount": "344",
                    "royaltiesBuyAmount": "40",
                    "protocolFeeBuyAmount": "16"
                  }
                }
              ],
              "nftContract": {
                "id": "0x69bbb21231b8c233fa35fc7c60968746b972517a",
                "allowList": true,
                "maxSupply": "4",
                "owner": null,
                "prices": [
                  {
                    "enabled": true,
                    "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                    "amount": "250000000",
                    "currencySymbol": "USDC",
                    "currencyDecimals": "6",
                    "currencyPriceUSDC": "1000000",
                    "currencyPriceUSDCFormatted": "1",
                    "minterAddress": "0xC6cCe35375883872826DdF3C30557F16Ec4DD94c",
                    "protocolFeeBps": "400",
                    "mintPriceStructure": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    },
                    "mintPriceStructureUsdc": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureUsdcFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    }
                  }
                ],
                "royalty": {
                  "bps": "1000",
                  "receiver": "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35"
                }
              },
              "mint": {
                "tokenData": "",
                "blockTimestamp": "1726141023",
                "totalPaid": "260000000",
                "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                "currencySymbol": "USDC",
                "currencyDecimals": "6",
                "currencyPriceUSDC": "1000000",
                "currencyPriceUSDCFormatted": "1",
                "mintTotalPaidFormatted": {
                  "totalPaid": "260"
                },
                "mintTotalPaidUsdc": {
                  "totalPaid": "260000000"
                },
                "mintTotalPaidUsdcFormatted": {
                  "totalPaid": "260"
                }
              },
              "prices": [],
              "currentProposals": [
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeid4ofrbahdhyb7aom4xxd6wfgejtcf7ckfbdqsivyr6absmfpwnmu/",
                    "creationTimestamp": "1726483927"
                  },
                  "rejectedProposal": null
                },
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://realt.co/ref/antho",
                    "creationTimestamp": "1726483927"
                  },
                  "rejectedProposal": null
                }
              ],
              "allProposals": [
                {
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://realt.co/ref/antho",
                  "rejectReason": null,
                  "creationTimestamp": "1726483927",
                  "lastUpdateTimestamp": "1726494399"
                },
                {
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeid4ofrbahdhyb7aom4xxd6wfgejtcf7ckfbdqsivyr6absmfpwnmu/",
                  "rejectReason": null,
                  "creationTimestamp": "1726483927",
                  "lastUpdateTimestamp": "1726494399"
                }
              ],
              "metadata": {
                "name": "Daily newsletter",
                "description": "One token equals one slot at the top of our daily newsletter.\nCryptoast delivers a newsletter 5 times a week, featuring the latest articles published on our website.\n\nThe newsletter is distributed to 5,000 e-mail addresses as of September 6, 2024.\nThe newsletter has an average open rate of 20%.\nThe click-through rate is 2% on average.\nEach month, 100,000 e-mails are sent, with 20,000 opened.\n\nHere is the evolution of the number of subscribers to our daily newsletter: \nJuly 6: 2,000 emails\nAugust 6: 3,700 emails -> +85% of subscribers\nSeptember 6: 5,000 emails -> +35% of subscribers",
                "image": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeihnhkwkgvn6z3wcfhvn3aghrvtjshubjqy22gn5tfned4okhx26ka/",
                "terms": "https://docs.google.com/document/d/1MeMC1pQ7_EwScSEbDHiyhCB2PafSTwvt-P4o1uQ26I4/edit?usp=sharing",
                "external_link": "Daily newsletter",
                "valid_from": "2024-09-17T22:00:00.000Z",
                "valid_to": "2024-10-17T22:00:00.000Z",
                "categories": [
                  "Community",
                  "NFT",
                  "Crypto"
                ],
                "token_metadata": {}
              }
            },
            {
              "tokenId": "2",
              "setInAllowList": true,
              "owner": "0x847fa118860fa9f99f2f048c7313c10c1b64dcbc",
              "marketplaceListings": [],
              "nftContract": {
                "id": "0x69bbb21231b8c233fa35fc7c60968746b972517a",
                "allowList": true,
                "maxSupply": "4",
                "owner": null,
                "prices": [
                  {
                    "enabled": true,
                    "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                    "amount": "250000000",
                    "currencySymbol": "USDC",
                    "currencyDecimals": "6",
                    "currencyPriceUSDC": "1000000",
                    "currencyPriceUSDCFormatted": "1",
                    "minterAddress": "0xC6cCe35375883872826DdF3C30557F16Ec4DD94c",
                    "protocolFeeBps": "400",
                    "mintPriceStructure": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    },
                    "mintPriceStructureUsdc": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureUsdcFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    }
                  }
                ],
                "royalty": {
                  "bps": "1000",
                  "receiver": "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35"
                }
              },
              "mint": {
                "tokenData": "",
                "blockTimestamp": "1726158075",
                "totalPaid": "260000000",
                "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                "currencySymbol": "USDC",
                "currencyDecimals": "6",
                "currencyPriceUSDC": "1000000",
                "currencyPriceUSDCFormatted": "1",
                "mintTotalPaidFormatted": {
                  "totalPaid": "260"
                },
                "mintTotalPaidUsdc": {
                  "totalPaid": "260000000"
                },
                "mintTotalPaidUsdcFormatted": {
                  "totalPaid": "260"
                }
              },
              "prices": [],
              "currentProposals": [
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeigojcpgbziagjokajrrji5aoe45hol4mvyicngdpsculvx2y5rpzu/",
                    "creationTimestamp": "1726240669"
                  },
                  "rejectedProposal": {
                    "status": "CURRENT_REJECTED",
                    "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeibxr7xd7iv6n3b7j4ezjucvccnd67g7gdnn7vn65ugbpmjyyibe7i/",
                    "rejectReason": "Dimensions non correctes",
                    "creationTimestamp": "1726160181"
                  }
                },
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://www.dinovox.com",
                    "creationTimestamp": "1726240669"
                  },
                  "rejectedProposal": {
                    "status": "CURRENT_REJECTED",
                    "data": "https://www.dinovox.com ",
                    "rejectReason": "Dimensions non correctes",
                    "creationTimestamp": "1726160181"
                  }
                }
              ],
              "allProposals": [
                {
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://www.dinovox.com",
                  "rejectReason": null,
                  "creationTimestamp": "1726240669",
                  "lastUpdateTimestamp": "1726248289"
                },
                {
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeigojcpgbziagjokajrrji5aoe45hol4mvyicngdpsculvx2y5rpzu/",
                  "rejectReason": null,
                  "creationTimestamp": "1726240669",
                  "lastUpdateTimestamp": "1726248289"
                },
                {
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "status": "CURRENT_REJECTED",
                  "data": "https://www.dinovox.com ",
                  "rejectReason": "Dimensions non correctes",
                  "creationTimestamp": "1726160181",
                  "lastUpdateTimestamp": "1726230083"
                },
                {
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "status": "CURRENT_REJECTED",
                  "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeibxr7xd7iv6n3b7j4ezjucvccnd67g7gdnn7vn65ugbpmjyyibe7i/",
                  "rejectReason": "Dimensions non correctes",
                  "creationTimestamp": "1726160181",
                  "lastUpdateTimestamp": "1726230083"
                }
              ],
              "metadata": {
                "name": "Daily newsletter",
                "description": "One token equals one slot at the top of our daily newsletter.\nCryptoast delivers a newsletter 5 times a week, featuring the latest articles published on our website.\n\nThe newsletter is distributed to 5,000 e-mail addresses as of September 6, 2024.\nThe newsletter has an average open rate of 20%.\nThe click-through rate is 2% on average.\nEach month, 100,000 e-mails are sent, with 20,000 opened.\n\nHere is the evolution of the number of subscribers to our daily newsletter: \nJuly 6: 2,000 emails\nAugust 6: 3,700 emails -> +85% of subscribers\nSeptember 6: 5,000 emails -> +35% of subscribers",
                "image": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeihnhkwkgvn6z3wcfhvn3aghrvtjshubjqy22gn5tfned4okhx26ka/",
                "terms": "https://docs.google.com/document/d/1MeMC1pQ7_EwScSEbDHiyhCB2PafSTwvt-P4o1uQ26I4/edit?usp=sharing",
                "external_link": "Daily newsletter",
                "valid_from": "2024-09-17T22:00:00.000Z",
                "valid_to": "2024-10-17T22:00:00.000Z",
                "categories": [
                  "Community",
                  "NFT",
                  "Crypto"
                ],
                "token_metadata": {}
              }
            },
            {
              "tokenId": "3",
              "setInAllowList": true,
              "owner": "0xbe28b1155c9552d9f0c2c861dd423480ca0a21e6",
              "marketplaceListings": [],
              "nftContract": {
                "id": "0x69bbb21231b8c233fa35fc7c60968746b972517a",
                "allowList": true,
                "maxSupply": "4",
                "owner": null,
                "prices": [
                  {
                    "enabled": true,
                    "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                    "amount": "250000000",
                    "currencySymbol": "USDC",
                    "currencyDecimals": "6",
                    "currencyPriceUSDC": "1000000",
                    "currencyPriceUSDCFormatted": "1",
                    "minterAddress": "0xC6cCe35375883872826DdF3C30557F16Ec4DD94c",
                    "protocolFeeBps": "400",
                    "mintPriceStructure": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    },
                    "mintPriceStructureUsdc": {
                      "creatorAmount": "250000000",
                      "protocolFeeAmount": "10000000",
                      "totalAmount": "260000000"
                    },
                    "mintPriceStructureUsdcFormatted": {
                      "creatorAmount": "250",
                      "protocolFeeAmount": "10",
                      "totalAmount": "260"
                    }
                  }
                ],
                "royalty": {
                  "bps": "1000",
                  "receiver": "0xac9055cdaf2f2ac1a9e140d918135c1d3aa7aa35"
                }
              },
              "mint": {
                "tokenData": "",
                "blockTimestamp": "1726171347",
                "totalPaid": "260000000",
                "currency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
                "currencySymbol": "USDC",
                "currencyDecimals": "6",
                "currencyPriceUSDC": "1000000",
                "currencyPriceUSDCFormatted": "1",
                "mintTotalPaidFormatted": {
                  "totalPaid": "260"
                },
                "mintTotalPaidUsdc": {
                  "totalPaid": "260000000"
                },
                "mintTotalPaidUsdcFormatted": {
                  "totalPaid": "260"
                }
              },
              "prices": [],
              "currentProposals": [
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeicdpbpwqgkzxx5ogrkebdh4beekwuljhx5ow2n2qpad6ebqkoy27q/",
                    "creationTimestamp": "1726503049"
                  },
                  "rejectedProposal": null
                },
                {
                  "adOffer": {
                    "id": "2"
                  },
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "pendingProposal": null,
                  "acceptedProposal": {
                    "status": "CURRENT_ACCEPTED",
                    "data": "https://x.com/Nemeos_Finance",
                    "creationTimestamp": "1726503049"
                  },
                  "rejectedProposal": null
                }
              ],
              "allProposals": [
                {
                  "adParameter": {
                    "id": "linkURL"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://x.com/Nemeos_Finance",
                  "rejectReason": null,
                  "creationTimestamp": "1726503049",
                  "lastUpdateTimestamp": "1726516435"
                },
                {
                  "adParameter": {
                    "id": "imageURL-16:9"
                  },
                  "status": "CURRENT_ACCEPTED",
                  "data": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeicdpbpwqgkzxx5ogrkebdh4beekwuljhx5ow2n2qpad6ebqkoy27q/",
                  "rejectReason": null,
                  "creationTimestamp": "1726503049",
                  "lastUpdateTimestamp": "1726516435"
                }
              ],
              "metadata": {
                "name": "Daily newsletter",
                "description": "One token equals one slot at the top of our daily newsletter.\nCryptoast delivers a newsletter 5 times a week, featuring the latest articles published on our website.\n\nThe newsletter is distributed to 5,000 e-mail addresses as of September 6, 2024.\nThe newsletter has an average open rate of 20%.\nThe click-through rate is 2% on average.\nEach month, 100,000 e-mails are sent, with 20,000 opened.\n\nHere is the evolution of the number of subscribers to our daily newsletter: \nJuly 6: 2,000 emails\nAugust 6: 3,700 emails -> +85% of subscribers\nSeptember 6: 5,000 emails -> +35% of subscribers",
                "image": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeihnhkwkgvn6z3wcfhvn3aghrvtjshubjqy22gn5tfned4okhx26ka/",
                "terms": "https://docs.google.com/document/d/1MeMC1pQ7_EwScSEbDHiyhCB2PafSTwvt-P4o1uQ26I4/edit?usp=sharing",
                "external_link": "Daily newsletter",
                "valid_from": "2024-09-17T22:00:00.000Z",
                "valid_to": "2024-10-17T22:00:00.000Z",
                "categories": [
                  "Community",
                  "NFT",
                  "Crypto"
                ],
                "token_metadata": {}
              }
            }
          ]
        },
        "metadata": {
          "creator": {
            "name": "",
            "description": "",
            "image": "",
            "external_link": "",
            "categories": [
              "dApp",
              "social",
              "media",
              "education"
            ]
          },
          "offer": {
            "name": "Daily newsletter",
            "description": "One token equals one slot at the top of our daily newsletter.\nCryptoast delivers a newsletter 5 times a week, featuring the latest articles published on our website.\n\nThe newsletter is distributed to 5,000 e-mail addresses as of September 6, 2024.\nThe newsletter has an average open rate of 20%.\nThe click-through rate is 2% on average.\nEach month, 100,000 e-mails are sent, with 20,000 opened.\n\nHere is the evolution of the number of subscribers to our daily newsletter: \nJuly 6: 2,000 emails\nAugust 6: 3,700 emails -> +85% of subscribers\nSeptember 6: 5,000 emails -> +35% of subscribers",
            "image": "https://75a96f0b0e8c3e2f83863f08abeec6e6.ipfscdn.io/ipfs/bafybeihnhkwkgvn6z3wcfhvn3aghrvtjshubjqy22gn5tfned4okhx26ka/",
            "terms": "https://docs.google.com/document/d/1MeMC1pQ7_EwScSEbDHiyhCB2PafSTwvt-P4o1uQ26I4/edit?usp=sharing",
            "external_link": "Daily newsletter",
            "valid_from": "2024-09-17T22:00:00.000Z",
            "valid_to": "2024-10-17T22:00:00.000Z",
            "categories": [
              "Community",
              "NFT",
              "Crypto"
            ],
            "token_metadata": {}
          }
        }
      }
    ],
    "_meta": {
      "block": {
        "timestamp": 1727201361
      }
    }
  }
}


```

</details>
