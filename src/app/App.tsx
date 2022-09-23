import React from 'react';
import {Graph} from "../components/graph/Graph";
import "./App.css";
import {BrowserGraphStorage} from "../components/graph/graphStorage";
import {sampleGraph} from "../components/graph/sampleData";

function App() {
  return (
    <Graph graphStorage={new BrowserGraphStorage(sampleGraph)}></Graph>
  );
}

export default App;
