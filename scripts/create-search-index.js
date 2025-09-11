const { MongoClient } = require("mongodb");

async function createSearchIndex() {
  const client = new MongoClient(
    process.env.MONGODB_URI || "your_connection_string"
  );

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("books");

    // Search index definition
    const indexDefinition = {
      name: "default",
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            title: {
              type: "string",
              analyzer: "lucene.standard",
            },
            language: {
              type: "string",
            },
            isbn: {
              type: "string",
            },
            author: {
              type: "objectId",
            },
            category: {
              type: "objectId",
            },
          },
        },
      },
    };

    // Create search index
    const result = await collection.createSearchIndex(indexDefinition);
    console.log("Search index created:", result);
  } catch (error) {
    console.error("Error creating search index:", error);
  } finally {
    await client.close();
  }
}

createSearchIndex();
