const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
const { ApolloServer } = require("apollo-server");
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')
const fs = require("fs");
const path = require("path");

/*
 * Check for GRAPHQL_SCHEMA environment variable to specify schema file
 * fallback to schema.graphql if GRAPHQL_SCHEMA environment variable is not set
 */

const typeDefs = fs
  .readFileSync(
    process.env.GRAPHQL_SCHEMA || path.join(__dirname, "schema.graphql")
  )
  .toString("utf-8");

// driver

const driver = neo4j.driver(
  process.env.GRAPHQL_HOST || "bolt://neo4j:7687",
  neo4j.auth.basic(
    process.env.GRAPHQL_USER || "neo4j",
    process.env.GRAPHQL_PASS || "semMedDb2020"
  )
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

async function main() {
  const schema = await neoSchema.getSchema();

  const server = new ApolloServer({
    schema,
    context: { driverConfig: { database: "semmed432202" } },
    introspection: true,
    playground: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
  });

  await server.listen(process.env.GRAPHQL_PORT || 4000);

  console.log("Online");
}

main();
