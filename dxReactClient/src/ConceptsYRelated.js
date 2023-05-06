import React, {useEffect, useState, useRef, useCallback} from 'react'
import {useLazyQuery, gql} from '@apollo/client'
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

const ConceptsYRelated = (props) => {
    
  const [sorting, setSorting] = useState([{ columnName: 'name', direction: 'asc' }]);
  
  const [count, setCount] = useState(500) // Concepts count
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizes] = useState([10, 20, 50, 100, 1000]);
  const [defaultHiddenColumnNames] = useState([]);
  const [selection, setSelection] = useState([]);
  const [grouping, setGrouping] = useState([]);

  const x_cui_list = props.selectionX 
  const z_cui_list = props.selectionZ 

  // const x_cui_list =  ["C0012860"]
  // const z_cui_list =  ["C3828416"]


  //const getRowId = row => row.cui; // function for record id for Selection
  const [columnWidths, setColumnWidths] = useState([
    { columnName: 'x_cui', width:90, align: 'left' },
    { columnName: 'xy_rel_type', width:150, align: 'left' },
    { columnName: 'xy_rel_freq', width:90, align: 'right' },
    { columnName: 'xy_rel_min_pyear', width:90, align: 'right' },
    { columnName: 'z_cui', width:100, align: 'left' },
    { columnName: 'yz_rel_type', width:150, align: 'left' },
    { columnName: 'yz_rel_freq', width:90, align: 'right' },
    { columnName: 'yz_rel_min_pyear', width:90, align: 'right' },
    { columnName: 'stys', width:150, align: 'left' },
    { columnName: 'cui', width:100, align: 'left'},
    { columnName: 'min_pyear', width:90, align: 'right'},
    { columnName: 'name', width:150, align: 'left'},
    { columnName: 'arg_inst_freq', width:90, align: 'right'},
    { columnName: 'arg_rel_freq', width:90, align: 'right'},
    { columnName: 'obj_inst_freq', width:90, align: 'right'},
    { columnName: 'obj_rel_freq', width:90, align: 'right'},
    { columnName: 'sub_inst_freq', width:90, align: 'right'},
    { columnName: 'sub_rel_freq', width:90, align: 'right'},
  ]);



const FIND_Y_RELATED_CONCEPTS_GRAPHQL = gql`
query RelatedConceptsYbyXZ ( $x_cui_list: [String!]!, $z_cui_list: [String!]! ) {
RelatedConceptsYbyXZCuiList(x_cui_list: $x_cui_list, z_cui_list:$z_cui_list, limit:200) {
    x_cui
    xy_rel_type
    xy_rel_freq
    xy_rel_min_pyear
    z_cui
    yz_rel_type
    yz_rel_freq
    yz_rel_min_pyear
    stys
    cui
    min_pyear
    name
    arg_inst_freq
    arg_rel_freq
    obj_inst_freq
    obj_rel_freq
    sub_inst_freq
    sub_rel_freq
  }
}
`
  const [columns] = useState([
    { name: 'x_cui', title: 'x_cui' },
    { name: 'xy_rel_type', title: 'xy_rel_type' },
    { name: 'xy_rel_freq', title: 'xy_rel_freq' },
    { name: 'xy_rel_min_pyear', title: 'xy_rel_min_pyea' },
    { name: 'z_cui', title: 'z_cui' },
    { name: 'yz_rel_type', title: 'yz_rel_type' },
    { name: 'yz_rel_freq', title: 'yz_rel_freq' },
    { name: 'yz_rel_min_pyear', title: 'yz_rel_min_pyear' },
    { name: 'stys', title: 'Stys' },
    { name: 'cui', title: 'Cui' },
    { name: 'min_pyear', title: 'min_pyear' },
    { name: 'name', title: 'Name' },
    { name: 'arg_inst_freq', title: 'arg_inst_fre' },
    { name: 'arg_rel_freq', title: 'arg_rel_freq' },
    { name: 'obj_inst_freq', title: 'obj_inst_freq' },
    { name: 'obj_rel_freq', title: 'obj_rel_freq' },
    { name: 'sub_inst_freq', title: 'sub_inst_freq' },
    { name: 'sub_rel_freq', title: 'sub_rel_freq' },
    ]);
    //const { loading, error, data } = useQuery(FIND_Y_RELATED_CONCEPTS_GRAPHQL,
    const [getYRelated, { called, loading, data }] = useLazyQuery(FIND_Y_RELATED_CONCEPTS_GRAPHQL,
    {
      variables: {
        x_cui_list: x_cui_list, 
        z_cui_list: z_cui_list
        //limit: pageSize, 
        //offset: pageSize * page,
      }
    });
    useEffect(() => {
      if(called && !loading) {
        
        setRows(data.RelatedConceptsYbyXZCuiList.map((p) => {
          //let stysA = p.stys.join();
          return {
                    x_cui: p.x_cui,
                    xy_rel_type: p.xy_rel_type,
                    xy_rel_freq: p.xy_rel_freq,
                    xy_rel_min_pyear: p.xy_rel_min_pyear,
                    z_cui: p.z_cui,
                    yz_rel_type: p.yz_rel_type,
                    yz_rel_freq: p.yz_rel_freq,
                    yz_rel_min_pyear: p.yz_rel_min_pyear,
                    stys: p.stys.join(),
                    cui: p.cui,                
                    min_pyear: p.min_pyear,
                    name: p.name,
                    arg_inst_freq: p.arg_inst_freq,
                    arg_rel_freq: p.arg_rel_freq,
                    obj_inst_freq: p.obj_inst_freq,
                    obj_rel_freq: p.obj_rel_freq,
                    sub_inst_freq: p.sub_inst_freq,
                    sub_rel_freq: p.sub_rel_freq,
                 }
                } ));   
             
      }
      setCount(rows.length)
    }, [data, called, loading, rows.length])

  const exporterRef = useRef(null);

  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);
  //console.log(filterName, filterCui, filterMinPyear, filterMinInstFreq, filterArgRelFreq)   
  console.log('selectedCuis=' + JSON.stringify(x_cui_list))
  console.log('selectedRelated=' + JSON.stringify(z_cui_list))
  return (
      <>
      <div>
      <Button
          variant="contained"
          color="primary"
          disabled={!(x_cui_list.length > 0 && z_cui_list.length > 0)}
          style={{marginTop:20}}
          // THIS HERE:
          onClick={getYRelated}
          >
          Find Related Y Concepts
        </Button>
      </div>  
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
        <h2>Intermediate Concepts Y</h2>
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
export default ConceptsYRelated;

