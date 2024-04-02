import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

export const options = {
    responsive: true,
    plugins: {

      title: {
        display: true,
        text: 'Averages By Department',
      },
    },
  };


function Dataset(id) {

    const [data, setData] = useState<any>();
    const [data2, setData2] = useState<any>();
    const [data3, setData3] = useState<any>();

    useEffect(() => {
            const query = {
              "WHERE": {},
              "OPTIONS": {
                "COLUMNS": [
                  id.id + "_dept",
                  id.id + "_avg",
                  id.id + "_instructor"
                ],
                "ORDER": id.id + "_avg"
              }
            }

            axios.post('http://localhost:4321/query', query) 
            .then(response => { 
              const avgSummed = {}
              const deps: string[] = []
              response.data.result.forEach(element => {
                const avgKey = id.id + "_dept";
                const deptKey = id.id + "_avg";
                const dept = element[avgKey];
                const avg = element[deptKey]
                if(!avgSummed[dept]) {
                  avgSummed[dept] = []
                  deps.push(dept)
                }
                avgSummed[dept].push(avg)
    
              });
              
              const avgs: number[] = [];
              for(const dep in avgSummed) {
                const averages = avgSummed[dep];
                const avg = averages.reduce((currSum, currVal) => currSum + currVal, 0) / averages.length;
                avgs.push(avg)
              }
              
              const dataToBe = {
                labels: deps,
                datasets: [
                  {
                    label: id.id + " Data",
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(75,192,192,0.4)',
                    hoverBorderColor: 'red',
                    data: avgs,
                  },
                ],
              };
              setData(dataToBe)
              const dataToBe2 = {
                labels: deps,
                datasets: [
                  {
                    label: id.id + " Data",
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(75,192,192,0.4)',
                    hoverBorderColor: 'red',
                    data: avgs,
                  },
                ],
              };
            }) 
            
      }, [])
    
      
    return (
        <>
        <div style={{ paddingTop: 25}}>        
        <strong >{id.id}</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row'}}>
        {
           data && <div style={{ width: '370px', height: '200px', paddingRight:30 }}>
            <Bar data = {data} options={options} ></Bar> 
            </div>
        }
        {
           data && <div style={{ width: '370px', height: '200px', paddingRight:30 }}>
            <Bar data = {data} options={options} ></Bar> 
            </div>
        }
        {
           data && <div style={{ width: '370px', height: '200px', paddingRight:30 }}>
            <Bar data = {data} options={options} ></Bar> 
            </div>
        }
        </div>
        </>

    );
}

export default Dataset;
