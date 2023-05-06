echo Fetching data

if [ ! -f ./neo4j/backup/'semmed43cord19.dump?dl=1' ]; then
    wget https://www.dropbox.com/s/1fzi43umt6u49pm/semmed43cord19.dump?dl=1
    mv 'semmed43cord19.dump?dl=1' neo4j/backup/
fi

if [ ! -f ./neo4j/backup/'semmed432202-2022-05-03-ftx-name-sentence.dump?dl=1' ]; then
    wget https://www.dropbox.com/s/3bsk8ar3vgskjws/semmed432202-2022-05-03-ftx-name-sentence.dump?dl=1
    mv 'semmed432202-2022-05-03-ftx-name-sentence.dump?dl=1' neo4j/backup/
fi

echo Starting Neo4j

docker-compose up -d neo4j

sleep 20

echo Restoring data
echo Restoring semmed43cord19

docker exec -it semmeddb-neo4j bin/neo4j-admin load --from=/backup/'semmed43cord19.dump?dl=1' --database=semmed43cord19 --force

echo Restoring semmed43

docker exec -it semmeddb-neo4j bin/neo4j-admin load --from=/backup/'semmed432202-2022-05-03-ftx-name-sentence.dump?dl=1' --database=semmed432202 --force

echo Configuring priviliges and creating databases

docker exec -it semmeddb-neo4j chown -R neo4j:neo4j /data

docker exec -it semmeddb-neo4j cypher-shell -u neo4j -p semMedDb2020 'CREATE DATABASE semmed432202;'
docker exec -it semmeddb-neo4j cypher-shell -u neo4j -p semMedDb2020 'CREATE DATABASE semmed43cord19;'

echo Stop database

docker-compose stop

echo Rewrite default database setting

sed -i 's/dbms.default_database=graph/dbms.default_database=semmed43cord19/g' neo4j/conf/neo4j.conf 

echo Seeding Neo4j is finished
