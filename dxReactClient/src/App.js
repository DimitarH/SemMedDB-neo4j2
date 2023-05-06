import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ConceptsTable from './ConceptsTable';
import ConceptsTableWhere from './ConceptsTableWhere';
import ConceptsRelated from './ConceptsRelated';
import ConceptsSelected from './ConceptsSelected';
import ConceptsZRelated from './ConceptsZRelated';
import PatientPheno from './PatientPheno';
import ClosedDiscovery from './ClosedDiscovery';
import ClosedDiscoveryNew from './ClosedDiscoveryNew';
import ConceptsYRelated from './ConceptsYRelated';
import ConceptsYRelatedNew from './ConceptsYRelatedNew';

import {
  BrowserRouter as Router,
    Route,
    Link,
    Routes
} from "react-router-dom";

 
  // or you can use `import gql from 'graphql-tag';` instead
//   client
//     .query({
//       query: gql`
//         {
//           concepts(options:{sort:{name: DESC} limit: 10, offset: 0}) {
//             cui
//             name
//             min_pyear
//             arg_inst_freq
//             arg_rel_freq
//             sub_inst_freq
//             sub_rel_freq
//           }
//         }
//       `
//     })
//     .then(result => console.log(result));
 
// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
//   paper: {
//     padding: theme.spacing(3),
//     textAlign: 'center',
//     color: theme.palette.text.primary,
//   },
// }));

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.primary,
  },
  menuButton: {
    marginRight: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
}));

function App()  {

    const [concSel, setConcSel] = useState([]);
    const [concSelRel, setConcSelRel] = useState([]) 
    

    // for Closed discovery
    const [xSel, setXSel] = useState([]);
    const [zSel, setZSel] = useState([]);
    const [xName, setXName] = useState("")
    const [zName, setZName] = useState("")

    const classes = useStyles();
    return (
    <div className={classes.root}>
    <Container maxWidth="lg">
    <Grid container  spacing={2}>
      <Router>
          <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          
          </IconButton>
          <Typography variant="h6" className={classes.title}>
          <Button color="inherit" component={Link} to={'/'}> Home</Button>
         
          </Typography>
          <Button color="inherit" component={Link} to={'/open'}>Open Discovery</Button>
          <Button color="inherit" component={Link} to={'/closed'}>Closed Discovery</Button>
        </Toolbar>
      </AppBar>
            {/* <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.paper}>
              <ConceptsTableWhere />
            </Grid>           */}
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.paper}>
          <Routes>           
            <Route  path='/open' exact element={<ConceptsTableWhere selection={concSel} setSelection={setConcSel} />} />
            <Route  path='/pheno' exact element={<PatientPheno />} />
            <Route  path='/related' exact element={<ConceptsRelated selection={concSel}/>} />
            <Route  path='/table' exact element={<ConceptsTable selection={concSel}/>} />
            <Route  path='/selected' exact element={<ConceptsSelected selection={concSel}/>} />
            <Route  path='/zrelated' exact element={<ConceptsZRelated selection={concSel} selectionRelated={concSelRel} />} />
            <Route  path='/closed' exact element={<ClosedDiscoveryNew 
                                                    xSel={xSel} 
                                                    setXSel={setXSel} 
                                                    zSel={zSel} 
                                                    setZSel={setZSel} 
                                                    xName={xName} 
                                                    setXName={setXName}
                                                    zName={zName} 
                                                    setZName={setZName} />} />
            {/* <Route  path='/yrelated' exact element={<ConceptsYRelated />} /> */}
            <Route  path='/yrelated' exact element={<ConceptsYRelatedNew />} />
            </Routes>

          {/* <Component1/>
          <Component2/> */}
            
      </Grid>
      </Router>
      </Grid>
      </Container>
      </div>
    );   

}
export default App;