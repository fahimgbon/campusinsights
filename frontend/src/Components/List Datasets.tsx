
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ListDatasets() { 
  const [ids, setIds] = useState([]); 
  
  useEffect(() => {
    axios.get('http://localhost:4321/datasets') 
    .then(response => { 
      setIds(response.data.result.map(item => item.id)); 
    }) 
  }, [])
  
  return ( 
    <div> 
      {ids.map(id => ( <div key={id}>{id}</div> ))} 
    </div> 
  );
}
  
export default ListDatasets;