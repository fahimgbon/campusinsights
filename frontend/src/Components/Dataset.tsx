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

  export const options2 = {
    responsive: true,
    plugins: {

      title: {
        display: true,
        text: 'Departments With Most Sections',
      },
    },
  };

  export const options3 = {
    responsive: true,
    plugins: {

      title: {
        display: true,
        text: 'Top 5 Courses With Most Sections',
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
                  id.id + "_instructor",
                  id.id + "_title"

                ],
                "ORDER": id.id + "_avg"
              }
            }

            axios.post('http://localhost:4321/query', query) 
            .then(response => { 
              const avgSummed = {}
              const deps: string[] = []
              const profs: string[] = []
              const titles: string[] = []

              response.data.result.forEach(element => {
                const avgKey = id.id + "_dept";
                const deptKey = id.id + "_avg";
                const profKey = id.id + "_instructor";
                const titleKey = id.id + "_title"
                const dept = element[avgKey];
                const avg = element[deptKey]
                const prof = element[profKey];
                const title = element[titleKey];
                if(!avgSummed[dept]) {
                  avgSummed[dept] = []
                  deps.push(dept)
                }
                profs.push(dept)
                titles.push(title)
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
              const count = {}
              profs.forEach(prof => {
                if (!count[prof]) {
                    count[prof] = 0;
                }
                count[prof] = count[prof] + 1;
              })
              const profArray = Object.entries(count).map(([string,count])  => ({string, count}))
              profArray.sort((a ,b) => (b as any).count - (a as any).count)
              const top5Profs = profArray.slice(0,5);
              const names = top5Profs.map(item => item.string)
              const counts = top5Profs.map(item => item.count)
              const dataToBe2 = {
                labels: names,
                datasets: [
                  {
                    label: id.id + " Data",
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(255, 99, 132, 0.5)',
                    hoverBorderColor: 'red',
                    data: counts,
                  },
                ],
              };
              setData2(dataToBe2)
              const count2 = {}
              titles.forEach(prof => {
                if (!count2[prof]) {
                    count2[prof] = 0;
                }
                count2[prof] = count2[prof] + 1;
              })
              const profArray2 = Object.entries(count2).map(([string,count])  => ({string, count}))
              profArray2.sort((a ,b) => (b as any).count - (a as any).count)
              const top5Profs2 = profArray2.slice(0,5);
              const names2 = top5Profs2.map(item => item.string)
              const counts2 = top5Profs2.map(item => item.count)
              const dataToBe3 = {
                labels: names2,
                datasets: [
                  {
                    label: id.id + " Data",
                    backgroundColor: 'yellow',
                    borderColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'yellow',
                    hoverBorderColor: 'red',
                    data: counts2,
                  },
                ],
              };
              setData3(dataToBe3)
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
            <Bar data = {data2} options={options2} ></Bar> 
            </div>
        }
        {
           data && <div style={{ width: '370px', height: '200px', paddingRight:30 }}>
            <Bar data = {data3} options={options3} ></Bar> 
            </div>
        }
        </div>
        </>

    );
}

export default Dataset;
