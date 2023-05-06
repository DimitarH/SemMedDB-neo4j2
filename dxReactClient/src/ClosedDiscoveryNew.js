import ConcTableExtSel from './ConcTableExtSel'
import { Button } from '@material-ui/core'
import React, {useState} from 'react'
import { useNavigate } from "react-router-dom";
const ClosedDiscoveryNew = (props) => {
    // const [x_cui_list, setX_cui_list] = useState(props.xSel)
    // const [z_cui_list, setZ_cui_list] = useState(props.zSel)
    
    const navigate = useNavigate()
    const handleSubmit = () => {
        console.log(JSON.stringify(props.xSel))
        console.log(JSON.stringify(props.zSel))
        navigate('/yrelated', { state: { x_cui_list: props.xSel, z_cui_list:props.zSel}})
    }
    console.log(JSON.stringify.props)
    return (
    <>
    <h2>NGS: Closed Discovery</h2>
    <ConcTableExtSel pageSize={5} title={"Find starting conceps X"} 
                     selection={props.xSel} 
                     setSelection={props.setXSel} 
                     name={props.xName}
                     setName={props.setXName}
                     />
    <ConcTableExtSel pageSize={5} title={"Find end conceps Z"} 
                    selection={props.zSel} 
                    setSelection={props.setZSel}  
                    name={props.zName}
                    setName={props.setZName}
                    />
    {/* {<div>{JSON.stringify(x_cui_list)}</div>
    <div>{JSON.stringify(z_cui_list)}</div>} */}
      <div>
      <Button
          variant="contained"
          color="primary"
          disabled={!(props.xSel.length > 0 && props.zSel.length > 0)}
          style={{marginTop:20}}
          // THIS HERE:
          onClick={handleSubmit}
          >
          Find Related Y Concepts
        </Button>
      </div>  
    </>
    )
}
export default ClosedDiscoveryNew;
