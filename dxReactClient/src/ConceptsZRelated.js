import React, {useEffect, useState, useRef, useCallback} from 'react'
import {useQuery, gql} from '@apollo/client'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Loading } from './material_ui/components/loading';
import {
  SortingState,
  IntegratedSorting,
  PagingState,
  IntegratedPaging,
  CustomPaging,
  SelectionState,
  IntegratedSelection,
  FilteringState,
  IntegratedFiltering,
  GroupingState,
  IntegratedGrouping,
  GroupingPanel
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
  ExportPanel,
  TableFilterRow,
  TableGroupRow,
} from '@devexpress/dx-react-grid-material-ui';
import saveAs from 'file-saver';
import ConceptsSelected from './ConceptsSelected';
//import FilterField from './FilterField';

const onSave = (workbook) => {
  workbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
  });
};

const ConceptsZRelated = (props) => {
    
  const [sorting, setSorting] = useState([{ columnName: 'name', direction: 'asc' }]);
  
  const [count, setCount] = useState(500) // Concepts count
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizes] = useState([10, 20, 50, 100, 1000]);
  const [defaultHiddenColumnNames] = useState([]);
  const [selection, setSelection] = useState([]);
  const [grouping, setGrouping] = useState([]);

  const x_cui_list = props.selection 
  const y_cui_list = props.selectionRelated 
  
  //const getRowId = row => row.cui; // function for record id for Selection
  const [columnWidths, setColumnWidths] = useState([
    { columnName: 'rel_type', width: 150, align: 'left' },
    {  columnName: 'rel_freq', width: 100, align: 'right'},
    {  columnName: 'rel_min_pyear', width: 100, align: 'right'},
    {  columnName: 'source_cui', width: 100, align: 'left'},
    { columnName: 'stys', width: 250, align: 'left' },
    { columnName: 'cui', width: 100, align: 'left'},
    { columnName: 'name', width: 200, align: 'left' },
    { columnName: 'min_pyear', width: 100, align: 'right' }
  ]);

  //  const RELATED_CONCEPTS_GRAPHQL = gql`
  //  query RelatedConceptsZbyCuiList ($x_cui_list:[String!]!,$y_cui_list:[String!]!, $limit:Int!, $offset:Int!)
  //   { 
  //     RelatedConceptsZbyCuiList(x_cui_list: $x_cui_list, y_cui_list:$y_cui_list , limit: $limit, offset: $offset) {
  //       rel_type
  //       rel_freq
  //       rel_min_pyear
  //       source_cui
  //       stys
  //       cui
  //       name
  //       min_pyear
  //     }
  //   }
  //`

const RELATED_CONCEPTS_GRAPHQL = gql`
query RelatedConceptsZbyCuiList ($x_cui_list:[String!]!,$y_cui_list:[String!]!)
 { 
   RelatedConceptsZbyCuiList(x_cui_list: $x_cui_list, y_cui_list:$y_cui_list, limit:500 ) {
     rel_type
     rel_freq
     rel_min_pyear
     source_cui
     stys
     cui
     name
     min_pyear
   }
 }
`


  const [columns] = useState([
    { name: 'rel_type', title: 'Rel_Type' },
    { name: 'rel_freq', title: 'Rel_freq' },
    { name: 'rel_min_pyear', title: 'Rel_min_pyear' },
    { name: 'source_cui', title: 'Source_cui' },
    { name: 'stys', title: 'Stys' },
    { name: 'cui', title: 'Cui' },
    { name: 'name', title: 'Name' },
    { name: 'min_pyear', title: 'min_pyear' },
    ]);
    const { loading, error, data } = useQuery(RELATED_CONCEPTS_GRAPHQL,
    {
      variables: {
        x_cui_list: x_cui_list, 
        y_cui_list: y_cui_list
        //limit: pageSize, 
        //offset: pageSize * page,
      }
    });
    useEffect(() => {
      if(!error && !loading) {
        
        setRows(data.RelatedConceptsZbyCuiList.map((p) => {
          //let stysA = p.stys.join();
          return {
                    rel_type: p.rel_type,
                    rel_freq: p.rel_freq,
                    rel_min_pyear: p.rel_min_pyear,
                    source_cui: p.source_cui,
                    stys: p.stys.join(),
                    cui: p.cui,                
                    name: p.name,
                    min_pyear: p.min_pyear
                 }
                } ));   
      }
      setCount(rows.length)
    }, [data, error, loading, rows.length])

  const exporterRef = useRef(null);

  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);
  //console.log(filterName, filterCui, filterMinPyear, filterMinInstFreq, filterArgRelFreq)   
  //console.log('selectedCuis=' + JSON.stringify(x_cui_list))
  //console.log('selectedRelated=' + JSON.stringify(y_cui_list))
  return (
      <>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
        <h2>Z Related Concepts</h2>
      </Grid>
      <Paper style={{ position: 'relative' }}>
        {loading && <Loading />}
        <DataGrid
          rows={rows}
          columns={columns}
          //getRowId = {getRowId}
          >
          <FilteringState defaultFilters={[]} />
          <IntegratedFiltering />
          <SortingState
            sorting={sorting}
            onSortingChange={setSorting}
          />
          <IntegratedSorting />
          <PagingState
            defaultCurrentPage={0}
            defaultPageSize={10}
          />
          <IntegratedPaging />
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
          <Toolbar />  
          <TableFilterRow />
          <PagingPanel 
            pageSizes={pageSizes}
          />
          <TableSelection showSelectAll />
          <TableColumnVisibility
            defaultHiddenColumnNames={defaultHiddenColumnNames}
          />
          <ExportPanel startExport={startExport} />
          <ColumnChooser />
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
export default ConceptsZRelated;

