import React, {useEffect, useState, useRef, useCallback} from 'react'
import {useQuery, gql} from '@apollo/client'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Loading } from './material_ui/components/loading';
import {
  SortingState,
  PagingState,
  CustomPaging,
  SelectionState,
  IntegratedSelection,
} from '@devexpress/dx-react-grid';
import { GridExporter } from '@devexpress/dx-react-grid-export';
import {
  Grid as DataGrid,
  DragDropProvider,
  Table,
  TableHeaderRow,
  ColumnChooser,
  TableColumnVisibility,
  Toolbar,
  TableColumnResizing,
  TableColumnReordering,
  PagingPanel,
  TableSelection,
  ExportPanel
} from '@devexpress/dx-react-grid-material-ui';
import saveAs from 'file-saver';
const onSave = (workbook) => {
  workbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
  });
};
const ConceptsSelected = (props) => {
  
  const [sorting, setSorting] = useState([{ columnName: 'name', direction: 'asc' }]);
  
  //const [name, setName] = useState("")
  const [count, setCount] = useState(0) // Concepts count
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizes] = useState([5, 10, 20]);
  const [defaultHiddenColumnNames] = useState([]);
  const [selection, setSelection] = useState([]);
  const getRowId = row => row.cui;
  
  const sortStr = '{' + sorting[0].columnName + ': ' + ( sorting[0].direction === 'asc' ? 'ASC' : 'DESC') + '}'
  const [columnWidths, setColumnWidths] = useState([
    { columnName: 'cui', width: 120, align: 'left'},
    { columnName: 'name', width: 500, align: 'left' },
    { columnName: 'min_pyear', width: 120, align: 'right' },
    { columnName: 'arg_inst_freq', width: 150, align: 'right' },
    { columnName: 'arg_rel_freq', width: 150, align: 'right' },
  ]);
  const sort = sortStr
  // const CONCEPTS_QUERY1 = gql`
  //   query getConcepts ($limit: Int!, $offset: Int!, $name: String) {
  //     conceptsAggregate(where:{name_CONTAINS: $name}) {
  //       count
  //     }
  //     concepts(where:{name_CONTAINS: $name}, options:{sort: ${sort}, limit: $limit, offset: $offset}) {
  //         cui
  //         name
  //         min_pyear
  //         arg_inst_freq
  //         arg_rel_freq
  //     }
  //   }
  // `
 const selCuis = props.selection//props.selection
 const CONCEPTS_QUERY1 = gql`
 query SelectedConcepts ( $cui_list:[String!]!, $limit: Int!, $offset: Int!) {
  		conceptsAggregate (where: {cui_IN:$cui_list } ) {
        count
      }
      concepts(where: { cui_IN: $cui_list }, options: {sort:{cui:ASC}, offset: $offset, limit: $limit }) {
      		cui
          name
          min_pyear
          arg_inst_freq
          arg_rel_freq
  }
}
`
   const [columns] = useState([
    { name: 'cui', title: 'Cui' },
    { name: 'name', title: 'Name' },
    { name: 'min_pyear', title: 'Min_pyear' },
    { name: 'arg_inst_freq', title: 'Arg_inst_freq' },
    { name: 'arg_rel_freq', title: 'Arg_rel_freq' },
    ]);
  
    const { loading, error, data } = useQuery(CONCEPTS_QUERY1,
    {
      variables: {
        cui_list: selCuis,
        limit: pageSize, 
        offset: pageSize * page,
      }
    });

    useEffect(() => {
      if(!error && !loading) {
        setCount(data.conceptsAggregate.count)
        setRows(data.concepts.map((p) => {
          return { cui: p.cui,
                   name: p.name,
                   min_pyear: p.min_pyear,
                   arg_inst_freq: p.arg_inst_freq,
                   arg_rel_freq: p.arg_rel_freq          
                 }
                } ));   
      }
    }, [data, error, loading, sorting])

  const exporterRef = useRef(null);

  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);
    return (
      <>
      {props.title ? <h1>{props.title}</h1> : "" }
      {props.subtitle ? <h2>{props.subtitle}</h2> : "" }
      <Paper style={{ position: 'relative' }}>
        {loading && <Loading />}
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId = {getRowId}
          >
          
          <Table 
            columnExtensions={columnWidths}
          />
          <TableHeaderRow />
        </DataGrid>
        <GridExporter
          ref={exporterRef}
          rows={rows}
          columns={columns}
          onSave={onSave}
        />
      </Paper>
      </>
      );
};
export default ConceptsSelected;