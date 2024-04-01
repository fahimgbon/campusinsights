
import axios from 'axios';
import React, { useEffect } from 'react';

function DatasetInsights() {
  const str = "sf"
  const query = {
    "WHERE": {
    },
    "OPTIONS": {
      "COLUMNS": [
        str + "_dept",
        "sf_avg"
      ],
      "ORDER": "sf_avg"
    }
  }

  useEffect(() => {
    axios.post('http://localhost:4321/query', query) 
    .then(response => { 
      console.log(response.data.result)
    }) 
  }, [])
  
  return (
    <div> Dataset Insights </div>
  );
}
  
export default DatasetInsights;