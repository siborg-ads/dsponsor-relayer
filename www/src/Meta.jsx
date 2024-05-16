import Head from "next/head";

const Meta = ({ title, keyword, description }) => {
  return (
    <div>
      <Head>
        <title>{title} || DSponsor - Unlock smarter monetization for your content.</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content={description} />
        <meta name="keyword" content={keyword} />
      </Head>
    </div>
  );
};

Meta.defaultProps = {
  title: "DSponsor | Unlock smarter monetization for your content.",
  keyword:
    "audience engagement, web3 monetization, web3, creator economic, NFT, creator monetization, creator economy, creator token, creator coin, creator tokenization, creator economy",
  description:
    "DSponsor is a platform that enables creators to monetize their content and engage with their audience in a smarter way."
};

export default Meta;
