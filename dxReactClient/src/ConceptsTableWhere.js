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
import FilterField from './FilterField';
import { Link, useNavigate } from "react-router-dom";


const onSave = (workbook) => {
  workbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
  });
};

const ConceptsTableWhere = (props) => {
  
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([{ columnName: 'name', direction: 'asc' }]);
  
  const [name, setName] = useState("")
  const [count, setCount] = useState(0) // Concepts count
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizes] = useState([10, 20, 50, 100, 1000]);
  const [defaultHiddenColumnNames] = useState([]);
  const [selection, setSelection] = useState([]);
  //const selection = props.selection;
  const getRowId = row => row.cui; // function for record id for Selection
  // Filters 
  const [filterCui, setFilterCui] = useState({})
  const [filterName, setFilterName] = useState({})
  const [filterMinPyear, setFilterMinPyear] = useState({})
  const [filterMinInstFreq, setFilterMinInstFreq] = useState({})
  const [filterArgRelFreq, setFilterArgRelFreq] = useState({})

  //const [whereExp, setWhereExp] = useState(' where: { AND: {name_CONTAINS: "amino"}},')
  const [whereExp, setWhereExp] = useState('')
 
  const [columnWidths, setColumnWidths] = useState([
    { columnName: 'cui', width: 120, align: 'left'},
    { columnName: 'name', width: 600, align: 'left' },
    { columnName: 'min_pyear', width: 120, align: 'right' },
    { columnName: 'arg_inst_freq', width: 150, align: 'right' },
    { columnName: 'arg_rel_freq', width: 150, align: 'right' },
  ]);
  //let whereExp = ""
  const sort = '{' + sorting[0].columnName + ': ' + ( sorting[0].direction === 'asc' ? 'ASC' : 'DESC') + '}'
  let countWhereExp = whereExp !== "" ?  "(" + whereExp.substring(0, whereExp.length - 1) + " )" : "";
  const handleFilter = () => {
    let str = MakeWhereStr()
    props.setSelection([])
    //if(!str) console.log("prazen where str")
    //console.log(str)
    
    setWhereExp(str)
    countWhereExp = whereExp !== "" ?  "(" + whereExp.substring(0, whereExp.length - 1) + " )" : "";
  }

  
  //const handleSetSelection = () => props.setSelection()

   const CONCEPTS_QUERY1 = gql`
    query getConcepts ($limit: Int!, $offset: Int!) {
      conceptsAggregate ${countWhereExp} {
        count
      }
      concepts(${whereExp} options:{sort: ${sort}, limit: $limit, offset: $offset}) {
          cui
          name
          min_pyear
          arg_inst_freq
          arg_rel_freq
      }
    }
  `
  const MakeWhereStr = () => {
    let filters  = []
    let whereStr = ""
    let rv = ""
    if(filterName.value) filters.push({
        name: filterName.name,
        op: filterName.op,
        value: filterName.value,
        type: filterName.type
    })
    if(filterCui.value) filters.push({
        name: filterCui.name,
        op: filterCui.op,
        value: filterCui.value,
        type: filterCui.type
    })
    if(filterMinPyear.value) filters.push({
        name: filterMinPyear.name,
        op: filterMinPyear.op,
        value: filterMinPyear.value,
        type: filterMinPyear.type
    })
    if(filterArgRelFreq.value) filters.push({
        name: filterArgRelFreq.name,
        op: filterArgRelFreq.op,
        value: filterArgRelFreq.value,
        type: filterArgRelFreq.type
    })
    if(filterMinInstFreq.value) filters.push({
        name: filterMinInstFreq.name,
        op: filterMinInstFreq.op,
        value: filterMinInstFreq.value,
        type: filterMinInstFreq.type
    })
    
   
    for(let i=0; i < filters.length; i++) {
        switch(filters[i].op) {
            case 'LT':
            case 'LTE':
            case 'GT':
            case 'GTE': 
            case 'NOT':
            case 'STARTS_WITH':
            case 'NOT_STARTS_WITH':
            case 'ENDS_WITH':
            case 'NOT_ENDS_WITH':
            case 'CONTAINS':
            case 'NOT_CONTAINS':
                rv = filters[i].name + '_' + filters[i].op + ":" 
                if(filters[i].type === "string")
                    rv += '"' + filters[i].value + '", '
                else
                    rv += filters[i].value + ","
                break
            case '' : // Operation =  
                rv = filters[i].name + ":" 
                if(filters[i].type === "string")
                    rv += '"' + filters[i].value + '", ' 
                else
                    rv += filters[i].value + ","
                break
            case 'NOT_IN':
            case 'IN':
              rv = filters[i].name + '_' + filters[i].op + ": ["
              if(filters[i].type === "string") {
                //first split the value of filter
                var arfilterValue = filters[i].value.toString().split(",")
                var filterValue = ''
                for(let j=0; j < arfilterValue.length; j++) {
                  filterValue += '"'+ arfilterValue[j].trim() + '"'
                  if(j < arfilterValue.length-1) filterValue += ','
                }
                rv += filterValue + "] ,"
              }
              else
                rv += filters[i].value  + "] ,"
                  
              break
                // rv = filters[i].name + '_' + filters[i].op + ": [" 
                // if(filters[i].type === "string") 
                //     rv += '"' + filters[i].value + '", '
                // else
                // 
                // break
            default: 
        }
        whereStr += rv ;
    }
    if(whereStr !== "")  
        return " where: { AND: {" + whereStr + " }},"
    else 
        return ""
  }

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
    }, [data, error, loading, name, sorting])

  const exporterRef = useRef(null);

  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);
  //console.log(filterName, filterCui, filterMinPyear, filterMinInstFreq, filterArgRelFreq)   
  console.log("selection = " + JSON.stringify(props.selection))
  return (
      <>
      <Grid container spacing={3}>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
        <h1>NGS: Open Discovery</h1>
        <h2>Find starting conceps X</h2>
      </Grid>
  
      <Grid item xl={2} lg={2} md={2} sm={6} xs={12} >
        <FilterField fieldName='name' name='name' fieldType='string' defaultOperation='CONTAINS' setFilter={setFilterName}  />
      </Grid>
      <Grid item xl={2} lg={2} md={2} sm={6} xs={12} >
        <FilterField fieldName='cui' name='Cui' fieldType='string' defaultOperation='CONTAINS' setFilter={setFilterCui}  />
      </Grid>
      <Grid item xl={2} lg={2} md={2} sm={6} xs={12} >
        <FilterField fieldName='min_pyear' name='MinPyera' fieldType='int' defaultOperation='' setFilter={setFilterMinPyear}  />
      </Grid>
      <Grid item xl={2} lg={2} md={2} sm={6} xs={12} >
        <FilterField fieldName='arg_inst_freq' name='ArgInstFreq' fieldType='int' defaultOperation='' setFilter={setFilterMinInstFreq}  />
      </Grid>
      <Grid item xl={2} lg={2} md={2} sm={6} xs={12} >
        <FilterField fieldName='arg_rel_freq' name='ArgRelFreq' fieldType='int' defaultOperation='' setFilter={setFilterArgRelFreq}  />
      </Grid>
      <Grid item xl={2} lg={2} md={2} sm={6} xs={12} >
        <Button variant="contained" color="primary" onClick={handleFilter}>Submit Filter</Button>
      </Grid>
      <Grid item xl={2} lg={2} md={2} sm={6} xs={12} >
      <Button
          variant="contained"
          color="primary"
          // THIS HERE:
          onClick={() => navigate('/related')}
          >
          Find Y Related Concepts
        </Button>
      </Grid>
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
            selection={props.selection}
            onSelectionChange={props.setSelection}
          />
          <IntegratedSelection />
          <Table 
            columnExtensions={columnWidths}
          />
          <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange={setColumnWidths}
          />
          <TableColumnReordering
              defaultOrder={['cui', 'name', 'min_pyear', 'arg_inst_freq', 'arg_rel_freq']}
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
      </>
      );
};
export default ConceptsTableWhere;

