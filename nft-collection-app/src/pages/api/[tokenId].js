
 export default function handler(req, res) {
   //get the tokenId from the query params
   const tokenId = req.query.tokenId;
   // As all the images are uploaded on github, we can extract the images github directly
   const image_url =  "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/";
   //The api is sending back metadata for a Crypto Dev
   // To make our collection compatible with opensea, we need to follow some metadata stds
   // When sending back the res from api
   // More info can be found here: https://docs.opensea.io/docs/metadata-standards
   res.status(200).json({
    name: "Crypto Dev #" + tokenId,
    description: "Crypto Dev is a collection of developers in crypto",
    images: image_url + tokenId + ".svg",
   });
 }




