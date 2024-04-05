
import React, { useState } from 'react';
import axios from 'axios';

function AddDataset() {
  const [form, setForm] = useState({ textInput: '', selectedFile: null });
  const [success, setSuccess] = useState(false);
  const [fail, setFail] = useState(false);
  const [failMsg, setFailMsg] = useState("");

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm({ ...form, [name]: name === 'selectedFile' ? files[0] : value });
  };


  const handleSubmit = (event) => {

    if(!form.textInput) {
      setFailMsg("Please add an id");
      setFail(true)
      return;
    }

    if(!form.selectedFile) {
      setFailMsg("Please attach a file");
      setFail(true)
      return;
    }

    const fileReader = new FileReader()

    fileReader.onload = () => {
      axios.put('http://localhost:4321/dataset/' + form.textInput + "/sections", fileReader.result)
      .then(response => {
        setSuccess(true)
        setFail(false)
      })
      .catch(error => {
        setSuccess(false)
        setFail(true)
        // setFailMsg(error.message)
		
		// Access the server's response message
		const message = error.response?.data?.error || "An unexpected error occurred";
		setFailMsg(message);
      })

    }
    fileReader.readAsArrayBuffer(form.selectedFile)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column'}}>
    <div className='container'>
      <label>Dataset Id:</label>
      <input type="text" name="textInput" value={form.textInput} onChange={handleChange} />
      <label> Upload Zip File:</label>
      <input className="input" type="file" name="selectedFile" onChange={handleChange} />
      <button onClick={handleSubmit} type="submit">Submit</button>
    </div>
    <div className='container'>
    {
      success && (
        <div style={{ backgroundColor: 'lightgreen', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
          Added Successfully!
        </div>
      )

    }

    {
      fail && (
        <div style={{ backgroundColor: '#ff6347', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
          {failMsg}
        </div>
      )
    }
    </div>
    </div>
  );
}

export default AddDataset;
