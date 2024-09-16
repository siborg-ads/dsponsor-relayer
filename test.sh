curl 'http://localhost:3000/api/11155111/graph' \
  -H 'accept: */*' \
  -H 'accept-language: fr-FR,fr;q=0.6' \
  -H 'content-type: application/json' \
  -H 'origin: https://testnet.dsponsor-app.siborg.io' \
  -H 'priority: u=1, i' \
  -H 'referer: https://testnet.dsponsor-app.siborg.io/' \
  -H 'sec-ch-ua: "Chromium";v="128", "Not;A=Brand";v="24", "Brave";v="128"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-gpc: 1' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' \
  --data-raw '{"query":"\n    query getAllMarketplaceListings {\n      adOffers(first: 1000, where: { id_in: [\"1\",\"20\",\"21\",\"22\",\"23\",\"24\",\"25\",\"26\",\"27\",\"28\",\"29\",\"30\",\"31\",\"32\",\"33\",\"34\",\"35\",\"36\",\"37\",\"38\",\"39\",\"40\",\"41\",\"42\",\"43\",\"44\",\"45\",\"46\",\"47\",\"48\",\"49\",\"50\",\"51\",\"52\",\"53\",\"54\",\"55\",\"56\",\"57\",\"58\",\"59\",\"60\",\"61\",\"62\",\"63\",\"64\",\"65\",\"66\",\"67\",\"68\",\"69\"] }) {\n        id\n        disable\n        metadataURL\n        nftContract {\n          royalty {\n            bps\n          }\n          tokens(first: 1000) {\n            tokenId\n            mint {\n              blockTimestamp\n              tokenData\n              totalPaid\n              currency\n            }\n            nftContract {\n              id \n              prices {\n                currency \n                amount \n                enabled\n              }\n            }\n            marketplaceListings(\n              where: { status_not_in: [\"CANCELLED\"]  }\n              first: 2\n              orderBy: id\n              orderDirection: desc\n            ) {\n              id \n              quantity\n              token {\n                tokenId\n                nftContract {\n                  id \n                  royalty {\n                    bps\n                  }\n                }\n                mint {\n                  tokenData\n                }\n              }\n              \n              listingType\n\n              currency               \n              reservePricePerToken\n              buyoutPricePerToken\n              bids(first: 1, orderBy: totalBidAmount, orderDirection: desc) {\n                 creationTimestamp\n                bidder\n                totalBidAmount\n                status\n                newPricePerToken\n                totalBidAmount\n                paidBidAmount\n                refundBonus\n                refundAmount\n                refundProfit\n              }\n\n              lister\n\n              startTime\n              endTime\n             \n              status\n\n              tokenType\n              transferType\n              rentalExpirationTimestamp\n            }\n          }\n        }\n      }\n    }\n  ","variables":{},"options":{"populate":true,"next":{"tags":["11155111-adOffer-1","11155111-adOffer-20","11155111-adOffer-21","11155111-adOffer-22","11155111-adOffer-23","11155111-adOffer-24","11155111-adOffer-25","11155111-adOffer-26","11155111-adOffer-27","11155111-adOffer-28","11155111-adOffer-29","11155111-adOffer-30","11155111-adOffer-31","11155111-adOffer-32","11155111-adOffer-33","11155111-adOffer-34","11155111-adOffer-35","11155111-adOffer-36","11155111-adOffer-37","11155111-adOffer-38","11155111-adOffer-39","11155111-adOffer-40","11155111-adOffer-41","11155111-adOffer-42","11155111-adOffer-43","11155111-adOffer-44","11155111-adOffer-45","11155111-adOffer-46","11155111-adOffer-47","11155111-adOffer-48","11155111-adOffer-49","11155111-adOffer-50","11155111-adOffer-51","11155111-adOffer-52","11155111-adOffer-53","11155111-adOffer-54","11155111-adOffer-55","11155111-adOffer-56","11155111-adOffer-57","11155111-adOffer-58","11155111-adOffer-59","11155111-adOffer-60","11155111-adOffer-61","11155111-adOffer-62","11155111-adOffer-63","11155111-adOffer-64","11155111-adOffer-65","11155111-adOffer-66","11155111-adOffer-67","11155111-adOffer-68","11155111-adOffer-69"]}}}'