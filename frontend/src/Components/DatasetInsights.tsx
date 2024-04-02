
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Dataset from './Dataset.tsx';

function DatasetInsights() {
  const [ids, setIds] = useState([]); 

  useEffect(() => {
    axios.get('http://localhost:4321/datasets') 
    .then(response => { 
      const ids = response.data.result.map(item => item.id);
      setIds(ids)
    }) 
  }, [])

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column'}}>
    {ids.map(id => ( <Dataset id={id} /> ))}
    </div>
  );
}
  
export default DatasetInsights;