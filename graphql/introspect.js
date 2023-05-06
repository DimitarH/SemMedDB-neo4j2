const { toGraphQLTypeDefs } = require("@neo4j/introspector")
const neo4j = require("neo4j-driver");
const fs = require('fs');

const driver = neo4j.driver(
    "neo4j://212.235.239.171:7687",
    neo4j.auth.basic("neo4j", "semMedDb2020")
);

const sessionFactory = () => driver.session({ defaultAccessMode: neo4j.session.READ, database: "semmed432202"})

// We create a async function here until "top level await" has landed
// so we can use async/await
async function main() {
    const typeDefs = await toGraphQLTypeDefs(sessionFactory)
    fs.writeFileSync('schema.graphql', typeDefs)
    await driver.close();
}
main()