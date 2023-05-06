import ConcTableExtSel from './ConcTableExtSel'
import React, {useState} from 'react'
import ConceptsYRelated from './ConceptsYRelated'
const ClosedDiscovery = () => {
    const [x_cui_list, setX_cui_list] = useState([])
    const [z_cui_list, setZ_cui_list] = useState([])

    return (
    <>
    <h2>NGS: Closed Discovery</h2>
    <ConcTableExtSel pageSize={5} title={"Find starting conceps X"} selection={x_cui_list} setSelection={setX_cui_list} />
    <ConcTableExtSel pageSize={5} title={"Find end conceps Z"} selection={z_cui_list} setSelection={setZ_cui_list}  />
    {/* {<div>{JSON.stringify(x_cui_list)}</div>
    <div>{JSON.stringify(z_cui_list)}</div>} */}
    <div>
        <ConceptsYRelated selectionX={x_cui_list} selectionZ={z_cui_list} />
    </div>
    </>
    )
}
export default ClosedDiscovery;
