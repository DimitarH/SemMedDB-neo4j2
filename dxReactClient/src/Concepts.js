import React, {useState} from 'react'
import {useQuery, gql} from '@apollo/client'
import Paper from '@material-ui/core/Paper';

const CONCEPTS_QUERY_COUNT = gql`
  query getConceptsCount  {
    conceptsAggregate {
      count
  }
  }
`
const sort = '{name: ASC}';

const CONCEPTS_QUERY1 = gql`
  query getConcepts ($limit: Int!, $offset: Int!) {
    concepts(options:{sort: ${sort}, limit: $limit, offset: $offset}) {
        cui
        name
        min_pyear
        arg_inst_freq
        arg_rel_freq
    }
  }
`

const Concepts = () => {
  const PAGE_SIZE = 20
  //const[pageNum, setPageNum] = useState(0)

  const [page, setPage] = useState(0)
  
  //const { loadingCount, errorCount, dataCount } = useQuery(CONCEPTS_QUERY_COUNT)

  const { loading, error, data } = useQuery(CONCEPTS_QUERY1,
    {
      variables: {
        limit: PAGE_SIZE, 
        offset: PAGE_SIZE * page,
      }
    });
      if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message} </p>;
      return (
          <>
          <nav style={{
            display: "flex",
            justifyContent: "space-between"
          }}
          >
            <button disabled={!page} onClick={()=>setPage(prev => prev - 1)}>Previous</button>
            <span>Page {page+1}</span>
            
            <button onClick={()=>setPage(prev => prev + 1)}>Next</button>

          </nav>
          <table border="1">
            <thead>
                <tr>
                    <th>CUI</th>
                    <th>Name</th>
                    <th>min_pyear</th>
                    <th>arg_inst_freq</th>
                    <th>arg_rel_freq</th>
                </tr>
            </thead>
            {
                data.concepts.map((concept, index) => (
                    <tr id={index.toString()}>
                      <td>{concept.cui}</td> 
                      <td>{concept.name}</td>
                      <td>{concept.min_pyear}</td>
                      <td>{concept.arg_inst_freq}</td>
                      <td>{concept.arg_rel_freq}</td>
                    </tr>
                  ))        
            }
          </table>
        </>
      )      
}
export default Concepts; 
