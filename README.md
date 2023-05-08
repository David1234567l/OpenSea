GraphQL Subgraph For OpenSea
This subgraph is for OpenSea, a popular decentralized marketplace for NFTs. I will provide a
general explanation of the schema, mapping file, and use cases for a subgraph that indexes data
from the OpenSea marketplace, as well as provide test cases for the subgraph.
Schema:
The schema is defined in the schema.graphql file and represents the structure of the data you
want to index and query. For the OpenSea subgraph, the schema includes the types Collection,
Token, Sale, and Fee. These types represent entities related to NFT collections, individual
tokens, sales transactions, and fees paid to the platform.
Mapping file:
The mapping file, usually named mapping.ts, contains the logic for processing and indexing data
from the smart contracts on the blockchain. It maps events emitted by the contracts to the entities
defined in the schema, and updates the data accordingly. For the OpenSea subgraph, mappings
are defined for events such as new NFT listings, token transfers, or sale transactions.
Use cases:
With this OpenSea subgraph, developers can build various applications or features that leverage
the indexed data. Some use cases include:
1. Displaying historical sales data for a specific NFT or collection.
2. Analyzing the most active buyers and sellers in the marketplace.
3. Tracking the total volume of sales or fees paid on the platform.
4. Identifying trends in NFT prices and activity over time.
5. Providing personalized recommendations based on users' browsing and purchase history.
Test cases:
To test the OpenSea subgraph, after running yarn codegen and yarn build and deploying
the subgraph on the graph, multiple GraphQL queries on ERC-721 tokens were tested to fetch
the data indexed by the subgraph. To run these queries, you can use the [Graph
Explorer](https://thegraph.com/explorer/) or a GraphQL client such as [Apollo
Client](https://www.apollographql.com/docs/react/).
Here are some example queries:
1. Retrieve all purchases made by a specific account:
{
account(id: "0xdac904a2165a9439dc5f04b82ae762707d3bf4cf") {
sales {
id
buyer {
id
}
seller {
id
}
price
paymentToken {
id
}
nft {
id
}
timestamp
}
}
}
2. Query the first 10 collections, This query will return the first 10 NFTs with their owner and
collection information.
{
nfts(first: 10) {
id
owner {
id
numberOfSales
numberOfPurchases
}
collection {
id
nft {
id
symbol
}
}
}
}
3. Query a specific token by its ID, including the token owner and related collection:
{
nft(id: "0xf4cd7e65348deb24e30dedee639c4936ae38b763-1023") {
id
owner {
id
numberOfSales
numberOfPurchases
}
collection {
id
nft {
id
symbol
}
}
}
}
4. Retrieve all sales for a specific collection:
{
collection(id: "0xf4cd7e65348deb24e30dedee639c4936ae38b763") {
sales {
id
buyer {
id
}
seller {
id
}
price
paymentToken {
id
}
nft {
id
}
timestamp
}
}
}
The reason that only ERC-721 NFTs work for this schema is that, although OpenSea also
supports ERC-1155 NFTs, these tokens have a different structure and require a different schema
to properly index and query them.
In the current schema, the `Collection` type includes a `totalSupply` field, which is specific to
ERC-721 tokens since they are indivisible and can only have a single token ID. On the other
hand, ERC-1155 tokens can have multiple token IDs and different amounts for each ID, which
makes the `totalSupply` field not applicable.
Therefore, if you wanted to index ERC-1155 NFTs in the OpenSea marketplace, you would need
to create a new schema specifically designed for them, taking into account their unique
properties and structures.
