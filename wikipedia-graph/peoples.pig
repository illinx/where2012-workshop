SET default_parallel 4;
TYPES = LOAD 's3://illinx-dinnergame/instance_types_en.nt.bz2' USING PigStorage(' ') AS (subj, pred, obj, dot);
PEOPLE_TYPES = FILTER TYPES BY obj == '<http://xmlns.com/foaf/0.1/Person>';
PEOPLE = FOREACH PEOPLE_TYPES GENERATE subj;

LINKS = LOAD 's3://illinx-dinnergame/page_links_en.nt.bz2' USING PigStorage(' ') AS (subj, pred, obj, dot);

SUBJ_LINKS_CO = COGROUP PEOPLE BY subj, LINKS BY subj;
SUBJ_LINKS_FILTERED = FILTER SUBJ_LINKS_CO BY NOT IsEmpty(PEOPLE) AND NOT IsEmpty(LINKS);
SUBJ_LINKS = FOREACH SUBJ_LINKS_FILTERED GENERATE FLATTEN(LINKS);

OBJ_LINKS_CO = COGROUP PEOPLE BY subj, SUBJ_LINKS BY obj;
OBJ_LINKS_FILTERED = FILTER OBJ_LINKS_CO BY NOT IsEmpty(PEOPLE) AND NOT IsEmpty(SUBJ_LINKS);
OBJ_LINKS = FOREACH OBJ_LINKS_FILTERED GENERATE FLATTEN(SUBJ_LINKS);

D_LINKS = DISTINCT OBJ_LINKS;

STORE D_LINKS INTO 's3://illinx-dinnergame/people-graph' USING PigStorage(' ');
