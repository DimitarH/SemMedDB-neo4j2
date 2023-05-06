import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
//import ApolloClient from 'apollo-boost';
//import { ApolloProvider } from '@apollo/react-hooks';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from "@apollo/client";

// const client = new ApolloClient({
//   uri: 'http://ngs-lbd.mf.uni-lj.si:64010',
// });

const client = new ApolloClient({
  uri: 'http://ngs-lbd.mf.uni-lj.si:64010',
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}> 
    <ErrorBoundary>
    <App />
    </ErrorBoundary>
  </ApolloProvider>
  ,
  document.getElementById('root')
);
