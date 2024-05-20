## Relayer

Relayer is a simple relay server that forwards requests to a key protected GraphQL endpoint.  
It provides additional features like caching, rate limiting, and request logging.

### Features

- [{chainID}/ad/0/0/image] - Get the image of the NFT with the given chainID, offerId and tokenID.
- [{chainID}/ad/0/0/link] - Get the link of the NFT with the given chainID, offerId and tokenID.

Iframe Embedding

- [{chainID}/iframe/5] - Get the iframe of the NFT with the given chainID and offerId.

### Example

<!-- <table>
    <tr>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/0/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/0/image" height="50"/>
            </a>
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/1/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/1/image" height="50"/>
            </a>     
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/2/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/2/image" height="50"/>
            </a>
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/3/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/3/image" height="50"/>
            </a>     
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/4/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/4/image" height="50"/>
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/5/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/5/image" height="50"/>
            </a>
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/6/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/6/image" height="50"/>
            </a>     
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/7/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/7/image" height="50"/>
            </a>
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/8/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/8/image" height="50"/>
            </a>     
        </td>
        <td>
            <a href="https://relayer.dsponsor.com/11155111/ad/3/9/link">
                <img src="https://relayer.dsponsor.com/11155111/ad/3/9/image" height="50"/>
            </a>
        </td>
    </tr>
</table> -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/0/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/0/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/1/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/1/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/2/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/2/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/3/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/3/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/4/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/4/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/5/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/5/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/6/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/6/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/7/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/7/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/8/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/8/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/9/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/9/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
</table>



```html

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/0/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/0/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/1/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/1/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/2/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/2/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/3/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/3/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/4/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/4/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
  <tr>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/5/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/5/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/6/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/6/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/7/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/7/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/8/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/8/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
    <td width="20%" style="text-align: center; padding: 10px;">
      <a href="https://relayer.dsponsor.com/11155111/ad/3/9/link" target="_blank">
        <img src="https://relayer.dsponsor.com/11155111/ad/3/9/image" width="100" height="100" style="display: block;" alt="No Ad">
      </a>
    </td>
  </tr>
</table>

```


## Getting Started

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
