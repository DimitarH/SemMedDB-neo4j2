import React, { useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

const FilterField = (props) => {
    
    const Styles = makeStyles((theme) => ({
        formControl: {
          margin: theme.spacing(1),
          minWidth: 150,
        },
        selectEmpty: {
          marginTop: theme.spacing(1),
        },
      }));

    const classes = Styles();

    const [filterOperations] = useState(
        props.fieldType === "string" ? 
        [
            {op : "", label: "=", isArray: false },
            {op : "CONTAINS", label: "Contains", isArray: false},
            {op : "NOT_CONTAINS", label: "NotContains", isArray: false },
            {op : "STARTS_WITH", label: "StartsWith", isArray: false },
            {op : "NOT_STARTS_WITH", label: "NotStartsWith", isArray: false },
            {op : "ENDS_WITH", label: "EndsWith", isArray: false },
            {op : "NOT_ENDS_WITH", label: "NotEndsWith", isArray: false },
            {op : "IN", label: "In", isArray: true },
            {op : "NOT_IN", label: "NotIn", isArray: true },
            {op : "GT", label: ">", isArray: false },
            {op : "GTE", label: ">=", isArray: false },
            {op : "LT", label: "<", isArray: false },
            {op : "LTE", label: "<=", isArray: false },
        ] 
        :
        [
            {op : "", label: "=", isArray: false },
            {op : "NOT", label: "<>", isArray: false },
            {op : "GT", label: ">", isArray: false },
            {op : "GTE", label: ">=", isArray: false },
            {op : "LT", label: "<", isArray: false },
            {op : "LTE", label: "<=", isArray: false },
            {op : "IN", label: "In", isArray: true },
            {op : "NOT_IN", label: "NotIn", isArray: true },
        ]
    )

    const [filterValue, setFilterValue] = useState("")
    const [operation, setOperation] = useState(props.defaultOperation)
   
    const handleOpChange = (e) => {
        props.setFilter({
            name: props.fieldName,
            op: e.target.value, 
            type: props.fieldType,
            value: filterValue
        })
        setOperation(e.target.value)
        console.log("operacija: " + operation)
    }

    const handleValueChange = (e) => {
        props.setFilter({
            name: props.fieldName,
            op: operation, 
            type: props.fieldType,
            value: e.target.value
        })
        setFilterValue(e.target.value)
        
    }
    return (
        <>
        <FormControl variant="outlined" className={classes.formControl}>
        <Select 
            native
            value={operation}
            onChange={handleOpChange}
             inputProps={{
             id: props.fieldName + 'op_id',
             name: props.fieldName + 'op',
            }}
        >
            { filterOperations.map((op) => 
                        <option key={op.op + '_op_key'} value={op.op}>{op.label}</option>
            )}
        </Select>
        </FormControl>
        <FormControl variant="outlined" className={classes.formControl}>
        <TextField id={props.fieldName + '_id'} label={props.name} value={filterValue} onChange={handleValueChange} variant="outlined" />
        </FormControl>
        </>
    )

}
export default FilterField;