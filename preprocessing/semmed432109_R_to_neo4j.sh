
# Make a directory for semmed432109
mkdir semmed432109
cd semmed432109
# Download semmedVER43_2021_R_WHOLEDB.sql.gz and unpack it

# gunzip it
gunzip semmedVER43_2021_R_WHOLEDB.sql.gz

# in shell:
mysql -u root -p
# in MariaDB [(none)]> 
drop database semmed4321;
# Query OK, 5 rows affected (5.45 sec)
# semmed432109: In mysql command line client we create a new empty database:
CREATE DATABASE semmed432109 /*!40100 DEFAULT CHARACTER SET utf8 */;
use semmed432109;
source ./semmedVER43_2021_R_WHOLEDB.sql
exit;

# MariaDB [semmed432109]> SELECT * FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='semmed432109';
# Current database: semmed432109
#
# +--------------+--------------+----------------------------+------------------------+----------+
# | CATALOG_NAME | SCHEMA_NAME  | DEFAULT_CHARACTER_SET_NAME | DEFAULT_COLLATION_NAME | SQL_PATH |
# +--------------+--------------+----------------------------+------------------------+----------+
# | def          | semmed432109 | utf8                       | utf8_general_ci        | NULL     |
# +--------------+--------------+----------------------------+------------------------+----------+


use semmed432109;
##################################
# Counts of records in the tables:
##################################
show tables;
#+------------------------+
#| Tables_in_semmed432109 |
#+------------------------+
#| CITATIONS              |
#| GENERIC_CONCEPT        |
#| PREDICATION            |
#| PREDICATION_AUX        |
#| SENTENCE               |
#+------------------------+

select count(*) from PREDICATION;
# 113863366 
select count(*) from PREDICATION_AUX;
# 113863364
### There should be 1:1 correspondence between PREDICATION and PREDICATION_AUX tables, but that's NOT true.
select count(*) from PREDICATION p, PREDICATION_AUX pa where p.predication_id=pa.predication_id;
# 113863364
select count(*) from CITATIONS;
# 32963356
select count(*) from SENTENCE;
# 223727931
select count(*) from GENERIC_CONCEPT;
# 259
########################
# END: Counts of records
########################


# Export from MySQL to text tab delimited files

# This SQL phrase to be used to convert the literal 'null' (string) value of EDAT that happens 20 times:
# convert(convert(IF(edat='null',CONCAT(SUBSTR(dp,1,4),'-01-01'),edat),DATE),CHAR)

# 2021-09-14:
select c.*,convert(convert(IF(edat='null',CONCAT(SUBSTR(dp,1,4),'-01-01'),edat),DATE),CHAR) into outfile 'citations.txt' 
fields terminated by '\t' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"' from CITATIONS c;
# Query OK, 32963356 rows affected (36.22 sec)

# 2021-09-14:
# A version of This query was first used for the LBD-COVID project. EDAT is exported in addition to PYEAR.
# EDAT is more granular than PYEAR (e.g. PYEAR=2010, EDAT="2010-03-20")
select p.subject_cui,p.subject_name,p.subject_semtype,p.predicate,p.object_cui,p.object_name,p.object_semtype,
       c.pyear,convert(convert(IF(c.edat='null',CONCAT(SUBSTR(c.dp,1,4),'-01-01'),c.edat),DATE),CHAR)    
 into outfile 'sub_rel_obj_pyear_edat.txt' CHARACTER SET utf8 fields terminated by '\t' 
 from CITATIONS c, PREDICATION p 
 where c.pmid=p.pmid and p.subject_novelty=1 and p.object_novelty=1 and p.subject_name<>p.object_name;
# Query OK, 78419682 rows affected (37 min 13.11 sec) 

# 2021-09-14
# What is GENERIC_CONCEPT table good for? WHat type of data it contains?
select g.* into outfile 'generic_concept.txt' fields terminated by '\t' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"' from GENERIC_CONCEPT g;
# Query OK, 259 rows affected (0.06 sec)

# 2021-09-14:
select s.SENTENCE_ID, s.PMID, s.TYPE, s.NUMBER, s.SENT_START_INDEX, s.SENT_END_INDEX, s.SECTION_HEADER, s.NORMALIZED_SECTION_HEADER, s.SENTENCE 
  into outfile 'sentence.txt' fields terminated by '\t' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"' 
  from SENTENCE s where s.pmid<>'00000000';
# There is no need for "where s.pmid<>'00000000'" in this version, but before it was needed  
# Query OK, 223727931 rows affected (9 min 1.31 sec)

# 2021-09-14:
select p.PREDICATION_ID, p.SENTENCE_ID, p.PMID, p.PREDICATE, p.SUBJECT_CUI, p.SUBJECT_NAME, p.SUBJECT_SEMTYPE, 
  p.SUBJECT_NOVELTY, p.OBJECT_CUI, p.OBJECT_NAME, p.OBJECT_SEMTYPE, p.OBJECT_NOVELTY, 
  a.SUBJECT_TEXT, a.SUBJECT_DIST, a.SUBJECT_MAXDIST, a.SUBJECT_START_INDEX, a.SUBJECT_END_INDEX,
  a.SUBJECT_SCORE, a.INDICATOR_TYPE, a.PREDICATE_START_INDEX, a.PREDICATE_END_INDEX, a.OBJECT_TEXT, 
  a.OBJECT_DIST, a.OBJECT_MAXDIST, a.OBJECT_START_INDEX, a.OBJECT_END_INDEX, a.OBJECT_SCORE, a.CURR_TIMESTAMP
into outfile 'predication_and_aux.txt' fields terminated by '\t' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"'
from PREDICATION p, PREDICATION_AUX a
where p.predication_id=a.predication_id and p.subject_novelty=1 and p.object_novelty=1 and p.subject_name<>p.object_name;
# Query OK, 78419680 rows affected (11 min 8.05 sec)

# 2021-09-17 Started upload of the entity *.sql file.
source ./semmedVER43_2021_R_ENTITY.sql

select count(*) from ENTITY;
# +------------+
# | count(*)   |
# +------------+
# | 1600754313 |
# +------------+
# 1 row in set (23 min 28.05 sec)
describe ENTITY;
#+-------------+------------------+------+-----+---------+----------------+
#| Field       | Type             | Null | Key | Default | Extra          |
#+-------------+------------------+------+-----+---------+----------------+
#| ENTITY_ID   | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
#| SENTENCE_ID | int(10) unsigned | NO   | MUL | NULL    |                |
#| PMID        | varchar(20)      | NO   | MUL |         |                |
#| CUI         | varchar(255)     | YES  |     | NULL    |                |
#| NAME        | varchar(999)     | YES  |     | NULL    |                |
#| SEMTYPE     | varchar(50)      | YES  |     | NULL    |                |
#| GENE_ID     | varchar(999)     | NO   |     |         |                |
#| GENE_NAME   | varchar(999)     | NO   |     |         |                |
#| TEXT        | varchar(999)     | YES  |     |         |                |
#| SCORE       | int(10) unsigned | YES  |     | 0       |                |
#| START_INDEX | int(10) unsigned | YES  |     | 0       |                |
#| END_INDEX   | int(10) unsigned | YES  |     | 0       |                |
#+-------------+------------------+------+-----+---------+----------------+
#12 rows in set (0.04 sec)

select count(*),count(distinct sentence_id),count(distinct pmid),count(distinct cui),count(distinct gene_id) from ENTITY;
#+------------+-----------------------------+----------------------+---------------------+-------------------------+
#| count(*)   | count(distinct sentence_id) | count(distinct pmid) | count(distinct cui) | count(distinct gene_id) |
#+------------+-----------------------------+----------------------+---------------------+-------------------------+
#| 1600754313 |                   206881026 |             28574901 |              504561 |                   26776 |
#+------------+-----------------------------+----------------------+---------------------+-------------------------+
#1 row in set (1 hour 24 min 50.62 sec)

# For some tasks, and for import into Neo4j, I would prefer to deal with the entities directly from a tab delimited text file
select e.* into outfile 'entity.txt' fields terminated by '\t' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"' from ENTITY e;

# On a typical Linux system, the export files go to /var/lib/mysql/DATABASE_NAME/*.txt and should be moved to the working directory with:
# next command to be done as root
# 2021-09-14:
su
mv /var/lib/mysql/semmed432109/*.txt /home/mitko/semmed432109/
cd /home/mitko/semmed432109/
ls *.txt
# citations.txt  generic_concept.txt  predication_and_aux.txt  sentence.txt  sub_rel_obj_pyear_edat.txt
# Change the owner and the group of the files if needed, replace OWNER and GROUP with proper values
chown OWNER:GROUP *.txt
# exit SU
exit

###################### Updated so far 2021.09.14 #################################
# 2021.09.16
# Preparing a file to be loaded in SWI-Prolog
# Before aggregation with datamash
# wc sub_rel_obj_pyear_edat.txt
#  78419682  821966401 6753224570 sub_rel_obj_pyear_edat.txt
# Aggregation with datamash: Group by sub_cui,sub_name,sub_semtype,relation,obj_cui,obj_name,obj_semtype then count and take the min pyear
datamash -s groupby 1,2,3,4,5,6,7 count 1 min 8 <sub_rel_obj_pyear_edat.txt >sub_rel_obj_cnt_minpyear.txt
# wc sub_rel_obj_cnt_minpyear.txt
#  22207608  237232246 1794459062 sub_rel_obj_cnt_minpyear.txt
# Another aggregation: Group by sub_cui,sub_name,relation,obj_cui,obj_name, list of unique sub_cuis, list of unique obj_cuis, count, min pyear
datamash -s groupby 1,2,4,5,6 unique 3 unique 7 count 1 min 8 <sub_rel_obj_pyear_edat.txt >sub_rel_obj_semtype_lists_cnt_minpyear.txt
# wc sub_rel_obj_semtype_lists_cnt_minpyear.txt
#  21561881  230504607 1747071309 sub_rel_obj_semtype_lists_cnt_minpyear.txt 
# Formating as Prolog facts (from sub_rel_obj_cnt_minpyear.txt to sub_rel_obj_cnt_minpyear.pl).
# sp means Semantic Predication or Semantic Relation. These are aggregated semantic relations.
# Field meaning: sp(subject_cui, subject_name, subject_semtype, relation, object_cui, object_name, object_semtype, frequency, min_pyear)
# CUI is Concept Unique Identifier, min_pyear is minimal (first) publication year or the year a first time a relation is mentioned.
# The subject and/or object might have existed long before min_pyear.
# First: escape every ' with \'
# Second: enclose strings in 'Concept name'
# Final result: Alzheimer's disease becomes 'Alzheimer\'s disease'
./txt2pl.awk sub_rel_obj_cnt_minpyear.txt >sub_rel_obj_cnt_minpyear.pl
# Example lines:
# grep "Alzheimer" sub_rel_obj_cnt_minpyear.pl|head -10
# sp('100124700', 'HOTAIR', gngm, 'ASSOCIATED_WITH', 'C0002395', 'Alzheimer\'s Disease', dsyn, 1, 2018).
# sp('10015', 'PDCD6IP', gngm, 'NEG_ASSOCIATED_WITH', 'C0002395', 'Alzheimer\'s Disease', dsyn, 1, 2015).
# sp('100293534', 'C4B_2', gngm, 'ASSOCIATED_WITH', 'C0002395', 'Alzheimer\'s Disease', dsyn, 2, 1987).
# sp('10043', 'TOM1', gngm, 'ASSOCIATED_WITH', 'C0002395', 'Alzheimer\'s Disease', dsyn, 2, 2016).
# sp('10048', 'RANBP9', gngm, 'AFFECTS', 'C0002395', 'Alzheimer\'s Disease', dsyn, 1, 2013).
# sp('10048', 'RANBP9', gngm, 'ASSOCIATED_WITH', 'C0002395', 'Alzheimer\'s Disease', dsyn, 2, 2013).
# sp('10048', 'RANBP9', gngm, 'AUGMENTS', 'C0002395', 'Alzheimer\'s Disease', dsyn, 1, 2013).
# sp('10048', 'RANBP9', gngm, 'CAUSES', 'C0002395', 'Alzheimer\'s Disease', dsyn, 1, 2012).
# sp('100507533', 'SOX21-AS1', gngm, 'AUGMENTS', 'C0002395', 'Alzheimer\'s Disease', dsyn, 1, 2018).
# sp('10058', 'ABCB6', gngm, 'ASSOCIATED_WITH', 'C0002395', 'Alzheimer\'s Disease', dsyn, 1, 2015).
gzip sub_rel_obj_cnt_minpyear.pl

# 2021-03-19:
# in: /home/mitko/semmed4321/
# Semantic relation aggregation with "datamash" tool
# Next line produces sty1,sty2,sty3 and list of unix EDATs edat1,edat2,edat3. Alone this command is NOT sufficient
datamash -s groupby 1,2,4,5,6 unique 3 unique 7 count 1 min 8 first 9 <sub_rel_obj_pyear_edat.txt >aggr_sub_rel_obj_freq_pyear_edat.txt
# Next line has gawk filter that: changes "," to ";" in stys (e.g sty1;sty2;sty3) and selects the first (minimum) EDAT from the list
datamash -s groupby 1,2,4,5,6 unique 3 unique 7 count 1 min 8 unique 9 <sub_rel_obj_pyear_edat.txt |\
 gawk -F"\t" 'BEGIN {OFS="\t"} {gsub(",",";",$6); gsub(",",";",$7); $10 = substr($10,1,10); print;}' >aggr_sub_rel_obj_freq_pyear_edat.txt
wc aggr_sub_rel_obj_freq_pyear_edat.txt
#  20651288  241076790 1897582966 aggr_sub_rel_obj_freq_pyear_edat.txt
# END: 2021-03-19


# $ pwd
#/home/mitko/GitHub/SemMedDB-neo4j/neo4j/backup
# prepare the argument nodes and the aggregated semantic relations
# 2021-04-16:
gawk -f ../../preprocessing/semmed4321_arg_rel_min_pyear.awk sub_rel_obj_pyear_edat.txt

# Four files created:
#   semmed4321_arg_stys_min_pyear_pfreq_hdr_srt.txt - header file for the argument nodes
#   semmed4321_arg_stys_min_pyear_pfreq_srt.txt    - the aggregated argument/concept nodes
#   semmed4321_rel_freq_min_pyear_pfreq_hdr_srt.txt - header file for the aggregated semantic relations
#   semmed4321_rel_freq_min_pyear_pfreq_srt.txt     - the aggregated relations

# Neo4j import has problems with "" (quotes) in the input strings
# Next line converts the 6th field in what neo4j expects for import, for example, Dimitar "Mitko" Hristovski is converted to "Dimitar ""Mitko"" Hristovski"
# sed -e 's/"/""/g' semmed31_201712_sentence.txt| gawk -F"\t" 'BEGIN {OFS="\t"} {print $1,$2,$3,$4,$5,"\"" $6 "\"",$7}' >semmed31_201712_sentence_double_quotes.txt
# However, the preceeding command is no longer necessary because it is solved already with the MySQL export options
# But, it is still needed to do the same conversion with the argument names, that's the 2nd field
# 2021-04-16:
sed -e 's/"/""/g' semmed4321_arg_stys_min_pyear_pfreq_srt.txt| gawk -F"\t" 'BEGIN {OFS="\t"} {print $1,"\"" $2 "\"",$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13}' >semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes.txt

# There were problems with sentences where PMID="00000000" because the last field is "N . We delete these sentences, actually we make a new file without them.
# I re-exported the data from mySQL without the sentences where PMID="00000000"

# 2021-04-16:
# Some argument nodes (concepts) have a lot of semantic type abbreviations in SemMedDB31.
# We keep only concepts with total length of stys less than 50 (less that 10 stys). We discard about 32 concepts by doing this.
gawk -F"\t" 'length($3)<50' semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes.txt >semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes_sty_lt_50.txt
# Here we make a file with those nodes (concepts) where the length of the concatenated stys is greater or equal to 50
gawk -F"\t" 'length($3)>=50' semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes.txt >semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes_sty_gte_50.txt
# In SemMedDB43 there are 0 arguments with stys greater that 50.
# stys length distribution:
gawk -F"\t" '{print length($3)}' semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes_sty_lt_50.txt | sort | uniq -c |more
#  13151 14
#   1234 19
#     61 24
# 248696 4
#      2 8
#  76755 9

# 2021-05-06:
# Done on ibmi-kastrin
# import files are in /home/bratanic/SemMedDB-neo4j/neo4j/data/import/semmed4321
# in the Docker container these files are in /var/lib/neo4j/data/import/semmed4321
# The import is run in the Docker container in /var/lib/neo4j/data/import/semmed4321
neo4j-admin import --verbose --high-io --database semmed4321core --delimiter TAB --nodes=Concept=semmed4321_arg_stys_min_pyear_pfreq_hdr_srt.txt,semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes_sty_lt_50.txt --relationships=semmed4321_rel_freq_min_pyear_pfreq_hdr_srt.txt,semmed4321_rel_freq_min_pyear_pfreq_srt.txt
# IMPORT DONE in 45s 575ms.
# Imported:
#  339899 nodes
#  20422856 relationships
#  85182147 properties
# Peak memory usage: 1.070GiB

# In cypher-shell in the docker container:
CREATE DATABASE semmed4321core;
# stop and start the Docker container.
# Now the semmed4321core database is available in the container

# Creating a dump of the semmed4321core databae:
# 1. stop the database from cypher-shell in the container with:  
STOP DATABASE semmed4321core;
# 2. exit cypher-shell
# 3. create the dump with neo4j-admin dump:
# In /var/lib/neo4j/data/dumps 
neo4j-admin dump --verbose --database=semmed4321core --to=semmed4321core_20210506.dump
# Done: 68 files, 2.191GiB processed.


# 2021-05-11:
# In citations_hdr.txt the edat field is excluded because it causes problems
neo4j-admin import --verbose --high-io --database semmed4321 --delimiter TAB --nodes=Citation=citations_hdr.txt,citations.txt --nodes=Sentence=sentence_hdr.txt,sentence.txt --relationships=IS_IN=rel_citation_to_sentence_hdr.txt,sentence.txt --nodes=Concept=semmed4321_arg_stys_min_pyear_pfreq_hdr_srt.txt,semmed4321_arg_stys_min_pyear_pfreq_srt_double_quotes_sty_lt_50.txt --relationships=semmed4321_rel_freq_min_pyear_pfreq_hdr_srt.txt,semmed4321_rel_freq_min_pyear_pfreq_srt.txt --nodes=Instance=predication_and_aux_hdr.txt,predication_and_aux.txt --relationships=Inst_Subject=rel_instance_subject_hdr.txt,predication_and_aux.txt --relationships=Inst_Object=rel_instance_object_hdr.txt,predication_and_aux.txt --relationships=Extracted_From=rel_instance_sentence_hdr.txt,predication_and_aux.txt



#!!! THE ENTITIES ARE NOT AVAILABLE YET 2019-08-09 !!!#
###################################
# Loaded to neo4j at mitko-pc2
# 2018-12-04. 
# This also includes the entities, but only the first 1M (1000000) lines of "entity" loaded (entity_first_1M.txt)
# Run in a "terminal" window in Neo4j Desktop.
# The command is run while being in the folder with the text delimited files because I have not enough space on my C:
# where the Neo4j software is:
# E:\semmed_db\mitkoux\semmed31_201806\
C:\Users\mitko\.Neo4jDesktop\neo4jDatabases\database-5ed72096-e40f-46a2-844f-fb95dc8282ac\installation-3.5.0\bin\neo4j-admin import --database SemMedDB31_201806_2 --delimiter TAB --ignore-missing-nodes=true --nodes:Citation "citations_hdr.txt,citations.txt" --nodes:Sentence "sentence_hdr.txt,sentence_no_zero_pmid.txt" --relationships:IS_IN "rel_citation_to_sentence_hdr.txt,sentence_no_zero_pmid.txt" --nodes:Concept "semmed31_arg_stys_min_pyear_pfreq_hdr.txt,semmed31_arg_stys_min_pyear_pfreq_double_quotes_sty_lt_50.txt" --relationships "semmed31_rel_freq_min_pyear_pfreq_hdr.txt,semmed31_rel_freq_min_pyear_pfreq.txt" --nodes:Instance "predication_and_aux_hdr.txt,predication_and_aux.txt" --relationships:Inst_Subject "rel_instance_subject_hdr.txt,predication_and_aux.txt" --relationships:Inst_Object "rel_instance_object_hdr.txt,predication_and_aux.txt" --relationships:Extracted_From "rel_instance_sentence_hdr.txt,predication_and_aux.txt" --nodes:Entity "entity_hdr.txt,entity_first_1M.txt" --relationships:From "rel_entity_sentence_hdr.txt,entity_first_1M.txt"

# In Neo4j, create full-text index on nodes with label "Concept", attribute "name" 
CALL db.index.fulltext.createNodeIndex("Concept",["Concept"],["name"]);

# Example usage:
CALL db.index.fulltext.queryNodes("Concept", "Surface") YIELD node, score;
# Started streaming 160 records after 69 ms and completed after 177 ms

# In Neo4j, create full-text index on nodes with label "Sentence", attributes "sentence","type","normalized_section_header","sentence_header"
CALL db.index.fulltext.createNodeIndex("Sentence",["Sentence"],["sentence","type","normalized_section_header","sentence_header"]);

# Example usage:
# Search for "sclerosis" anywhere in a "Sentence" node
CALL db.index.fulltext.queryNodes("Sentence","sclerosis") YIELD node, score return node.sentence,score;
# Search for "sclerosis" only in the text of a sentence
CALL db.index.fulltext.queryNodes("Sentence","sentence:sclerosis") YIELD node, score return node.sentence,score;
# Search for "sclerosis" in the text of title sentences only
CALL db.index.fulltext.queryNodes("Sentence","sentence:sclerosis AND type:TI") YIELD node, score return node.sentence,score;
# Search for "sclerosis" in the text of abstract sentences only
CALL db.index.fulltext.queryNodes("Sentence","sentence:sclerosis AND type:AB") YIELD node, score return node.sentence,score;

################
# Make a "dump" file with the whole database in one file. The Neo4j server should be shut down first.
# It is very easy to load this file with a "load" Neo4j command.
# Below it is run in the same folder where "dump" file goes, but other combinations exist.
# In E:\semmed_db\mitkoux\semmed31_201806\
C:\Users\mitko\.Neo4jDesktop\neo4jDatabases\database-5ed72096-e40f-46a2-844f-fb95dc8282ac\installation-3.5.0\bin\neo4j-admin dump --database SemMedDB31_201806_2 --to=SemMedDB31_201806_2.dump


# end of semmed31_201806

