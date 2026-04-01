import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { serverUrl } from "../helpers/Constants";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";


interface CountryStat{
    _id: string;
    count: number;
}
interface DeviceStat{
    _id: string;
    count: number;
}
interface DailyStat{
    _id:string;
    count:number;
}
interface AnalyticsData{
    shortUrl: string;
    totalClicks: number;
    countryStats: CountryStat[];
    deviceStats: DeviceStat[];
    dailyStats: DailyStat[];
}

const AnalyticsPage = () => {
    const { shortUrl} = useParams<{ shortUrl: string}>();

    const [data, setData]= useState<AnalyticsData | null>(null);
    console.log("SERVER URL:", serverUrl);
    // ✅ ADD COLORS HERE (IMPORTANT)
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
    useEffect(() => {
        const fetchAnalytics = async () => {
            try{
                console.log("SHORT URL PARAM:", shortUrl);   // ✅ ADD HERE
                const url=`${serverUrl}/analytics/${shortUrl}`;
                // console.log("Calling API:", url);
                console.log("FULL API URL:", url);           // ✅ ADD HERE
                const res = await axios.get(
                    url,
                    {
                        headers:{
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                console.log("Analytics response:", res);
                console.log("DATA:", res.data);
                setData(res.data);
                console.log("STATE SET SUCCESS");  //saimply check
            }
            catch(error: any){
                console.log("ERROR STATUS:", error?.response?.status);
                console.error("Analytics fetch error:", error?.response?.data);
            }
        };

        if (shortUrl) {
            fetchAnalytics();
        }
    }, [shortUrl]);

    // if (!data) {
    //     return <p style ={{ padding: "20px" }}>Loading analytics...</p>
    // }
    return (
        <div style={{ padding: "20px"}}>
            {!data ? (
                <p>Loading analytics...</p>
            ):(
            <>

                <h2>Analytics for {data.shortUrl}</h2>
                <h3>Total clicks: {data.totalClicks}</h3>

                {/* Country stats */} 
                <h3>
                    Clicks by Country
                </h3>
                <BarChart width={500} height={300} data={data.countryStats || []}>
                    <XAxis dataKey="_id"/>
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count"/>
                </BarChart>

                {/* Device Stats */}
                <h3>Device stats</h3>
                
                <PieChart width={400} height={400}>
                    
                    <Pie
                        data={data.deviceStats || []}
                        dataKey="count"
                        nameKey="_id"
                        outerRadius={100}
                    >
                        
                        {(data.deviceStats || []).map((_, index) => (
                            <Cell 
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip/>
                </PieChart>

                {/* Daily Stats */}
                <h3>Clicks Per Day</h3>

                <LineChart width={600} height={300} data={data.dailyStats || []}>
                    <XAxis dataKey="_id"/>
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" />
                </LineChart>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;