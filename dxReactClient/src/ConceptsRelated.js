import React, {useEffect, useState, useRef, useCallback} from 'react'
import {useQuery, gql} from '@apollo/client'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
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
import ConceptsSelected from './ConceptsSelected';
import ConceptsZRelated from './ConceptsZRelated';
//import FilterField from './FilterField';

const onSave = (workbook) => {
  workbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
  });
};

const ConceptsRelated = (props) => {
    
  const [sorting, setSorting] = useState([{ columnName: 'name', direction: 'asc' }]);
  
  const [count, setCount] = useState(0) // Concepts count
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizes] = useState([10, 20, 50, 100, 1000]);
  const [defaultHiddenColumnNames] = useState([]);
  const [selection, setSelection] = useState([]);
  const getRowId = row => row.cui; // function for record id for Selection
  const selectedCuis = props.selection
  //const [whereExp, setWhereExp] = useState(' where: { AND: {name_CONTAINS: "amino"}},')
  const[relVisible, setRelVisible] = useState(false)
  const [columnWidths, setColumnWidths] = useState([
    { columnName: 'source_cui', width: 100, align: 'left'},
    { columnName: 'rel_type', width: 200, align: 'left' },
    { columnName: 'cui', width: 100, align: 'left'},
    { columnName: 'stys', width: 250, align: 'left' },
    { columnName: 'cui', width: 100, align: 'left'},
    { columnName: 'name', width: 330, align: 'left' },
    { columnName: 'arg_inst_freq', width: 150, align: 'right' }
  ]);
 
   const RELATED_CONCEPTS_GRAPHQL = gql`
   query ReletedConcepts ( $cui_list:[String!]!, $limit: Int!, $offset: Int!) {
      RelatedConceptsByCuiListCount(cui_list:$cui_list)
      RelatedConceptsByCuiList(cui_list: $cui_list, offset: $offset, limit: $limit) {
      source_cui
      rel_type  
      stys
      cui
      name
      arg_inst_freq
  }
}   
`
  const [columns] = useState([
    
    { name: 'source_cui', title: 'Source_cui' },
    { name: 'rel_type', title: 'Rel_Type' },
    { name: 'cui', title: 'Cui' },
    { name: 'stys', title: 'Stys' },
    { name: 'name', title: 'Name' },
    { name: 'arg_inst_freq', title: 'Arg_inst_freq' },
    ]);
  
    const { loading, error, data } = useQuery(RELATED_CONCEPTS_GRAPHQL,
    {
      variables: {
        limit: pageSize, 
        offset: pageSize * page,
        cui_list: selectedCuis
      }
    });

    useEffect(() => {
      if(!error && !loading) {
        
        setCount(data.RelatedConceptsByCuiListCount)
        setRows(data.RelatedConceptsByCuiList.map((p) => {
          //let stysA = p.stys.join();
          return {
                    source_cui: p.source_cui,
                    rel_type: p.rel_type,
                    cui: p.cui, 
                   stys: p.stys.join(),
                   name: p.name,
                   arg_inst_freq: p.arg_inst_freq
                 }
                } ));   
      }
    }, [data, error, loading])

  const exporterRef = useRef(null);

  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);

  const handleZRelated= () => {
    if(relVisible) {
      setRelVisible(false)
    }
    else {
        if( selection.length > 0 && selectedCuis.length > 0) 
          setRelVisible(true)
        else
          setRelVisible(true)
    }
  }
  //console.log(filterName, filterCui, filterMinPyear, filterMinInstFreq, filterArgRelFreq)   
  console.log('selectedCuis=' + JSON.stringify(selectedCuis))
  return (
      <>
      <ConceptsSelected title="NGS: Open Discovery" subtitle="Selected concepts X"selection={selectedCuis}/>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
        <h2>Related Concepts Y</h2>
      </Grid>
      <Paper style={{ position: 'relative' }}>
        {loading && <Loading />}
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId = {getRowId}
          >
          <SortingState
            sorting={sorting}
            onSortingChange={setSorting}
          />
          <PagingState
            currentPage={page}
            onCurrentPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
          <CustomPaging
            totalCount={count}
          />
          <DragDropProvider />
          <SelectionState
            selection={selection}
            onSelectionChange={setSelection}
          />
          <IntegratedSelection />
          <Table 
            columnExtensions={columnWidths}
          />
          <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange={setColumnWidths}
          />
          <TableHeaderRow showSortingControls />
          <TableSelection showSelectAll />
          <TableColumnVisibility
            defaultHiddenColumnNames={defaultHiddenColumnNames}
          />
          <Toolbar />
          <ExportPanel startExport={startExport} />
          <ColumnChooser />
          <PagingPanel 
            pageSizes={pageSizes}
          />
        </DataGrid>
        <GridExporter
          ref={exporterRef}
          rows={rows}
          columns={columns}
          onSave={onSave}
        />
      </Paper>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}  >
        {/* <Button variant="contained" color="primary" onClick={handleZRelated}>{relVisible?"Hide Z Related Concepts" : "Find Z Related Concepts"}</Button> */}
        <Button
          variant="contained"
          color="primary"
          style={{marginTop: '20'}}
          disabled={!selection.length}
          // THIS HERE:
          onClick={handleZRelated}
          >
          {relVisible?"Hide Z Related Concepts" : "Find Z Related Concepts"}
        </Button>
      </Grid>
      {relVisible && <ConceptsZRelated selection={selectedCuis} selectionRelated={selection}/>

      }
      </>
      );
};
export default ConceptsRelated;

