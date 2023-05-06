# SemMedDB-neo4j
A repository to set up and run the Neo4j containing an extended version of the SemMedDB database

Create read only user

```
CREATE USER read_only SET PASSWORD "SemMedDb2021" CHANGE NOT REQUIRED;
GRANT ROLE reader TO read_only;
```
