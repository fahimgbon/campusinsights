
import React, { useState } from 'react';
import axios from 'axios';

function RemoveDataset() {
  const [id, setId] = useState(""); 
  const [success, setSuccess] = useState(false);  

  const handleChange = (event) => { 
    setId(event.target.value)
  };


  const handleSubmit = (event) => { 

    axios.delete('http://localhost:4321/dataset/' + id)
    .then(response => {
      setSuccess(true)
    })
    .catch(error => {
      console.log(error)
    })

  }; 
  
  return (
    <div  style={{ display: 'flex', flexDirection: 'column'}}> 
    <div className='container'> 
      <label> Dataset Id To Delete:</label> 
      <input type="text" name="textInput" value={id} onChange={handleChange} />  
      <button onClick={handleSubmit} type="submit">Submit</button> 
    </div>
    <div className='container'>
    {
      success && (
        <div style={{ backgroundColor: 'lightgreen', padding: '10px', borderRadius: '5px', marginTop: '10px' }}> 
          Deleted Successfully! 
        </div>
      )
    }
    </div>
    </div>
  );
}
  
export default RemoveDataset;