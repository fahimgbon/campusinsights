import './App.css';
import React, { useState } from 'react';
import ListDatasets from './Components/List Datasets.tsx';
import DatasetInsights from './Components/DatasetInsights.tsx';
import AddDataset from './Components/AddDataset.tsx';
import RemoveDataset from './Components/RemoveDataset.tsx';

function App() {
  const [list, setList] = useState(false);
  const [add, setAdd] = useState(false);
  const [remove, setRemove] = useState(false);
  const [insight, setInsight] = useState(false);

  const handleListDatasets = async () => {
    setList(true)
    setAdd(false)
    setRemove(false)
    setInsight(false)
  }

  const handleAddDatasets = async () => {
    setList(false)
    setAdd(true)
    setRemove(false)
    setInsight(false)
  }

  const handleRemoveDatasets = async () => {
    setList(false)
    setAdd(false)
    setRemove(true)
    setInsight(false)
  }

  const handleDatasetInsights = async () => {
    setList(false)
    setAdd(false)
    setRemove(false)
    setInsight(true)
  }

  return (
    <>
      <div className="App">
        <button onClick={handleAddDatasets}> Add Dataset </button>
        <button onClick={handleRemoveDatasets}> Remove Dataset </button>
        <button onClick={handleListDatasets}> List Datasets </button>
        <button onClick={handleDatasetInsights}> Dataset Insights </button>
      </div>
      <div className="App">
        {list && (
          <ListDatasets></ListDatasets>
        )}
        {add && (
          <AddDataset></AddDataset>
        )}
        {remove && (
          <RemoveDataset></RemoveDataset>
        )}
        {insight && (
          <DatasetInsights></DatasetInsights>
        )}
      </div>
    </>
  );
}

export default App;
