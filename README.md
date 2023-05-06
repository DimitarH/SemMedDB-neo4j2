# SemMedDB-neo4j
A repository to set up and run the Neo4j containing an extended version of the SemMedDB database

This project was funded in part by the Slovenian Research Agency (Grant No. J5-1780, project name: Using Literature-based Discovery for Interpretation of Next Generation Sequencing Results).

Create read only user

```
CREATE USER read_only SET PASSWORD "SemMedDb2021" CHANGE NOT REQUIRED;
GRANT ROLE reader TO read_only;
```
