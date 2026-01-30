// Import the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding
const indexName = pc.Index("chat-gpt-project");

async function upsertVectors({ Id, vectors, metadata }) {
  await indexName.upsert([
    {
      id: Id,
      values: vectors,
      metadata: metadata,
    },
  ]);
}

async function queryVectors({ vectors, limit = 5, metadata }) {
  const queryResponse = await indexName.query({
    vector: vectors,
    topK: limit,
    filter: metadata ? metadata : undefined,
    includeMetadata: true,
  });
  return queryResponse.matches;
}

module.exports = { upsertVectors, queryVectors };
