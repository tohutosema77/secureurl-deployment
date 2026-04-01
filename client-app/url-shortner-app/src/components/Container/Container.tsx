import * as React from 'react';
import FormContainer from '../FormContainer/FormContainer';
import type { UrlData } from '../../interface/UrlData';
import axios from 'axios';
import { serverUrl } from '../../helpers/Constants';
import DataTable from '../DataTable/DataTable';
import { useNavigate } from 'react-router-dom';
import PaymentButton from '../Payment/PaymentButton';
interface IContainerProps {}

const Container: React.FunctionComponent<IContainerProps> = () => {

  const [user, setUser] = React.useState<any>(null);
  const [data, setData] = React.useState<UrlData[]>([]);
  const  [reload, setReload] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const updateReloadState = (): void => {
    setReload(true);
  };

  //fetching the data altogether
  // const fetchTableData = async () => {
  //   const response= await axios.get(`${serverUrl}/shortUrl`);
  //   console.log("The response from server is : ", response);
  //   setData(response.data);
  //   setReload(false);
  // };

  // const token = localStorage.getItem('token');
  // if(!token){
  //   return(
  //     <div>Please Login first</div> 
  //   )     
    
  // }
  // React.useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   if(!token){
  //     navigate("/login");
  //   }
  // }, []);
 
  const fetchUser = async () =>{
      try {
        const res= await axios.get(
          `${serverUrl}/auth/currentUser`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        console.log("User data:", res.data);
        setUser(res.data);
      } catch (error) {
        console.log(error);
      }
  };

  const fetchTableData = async () => {
    
    try{

      const response = await axios.get(
        `${serverUrl}/short/shortUrl/myurls`,
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      console.log("The response from server is : ", response);

      setData(response.data);
      setReload(false);
    }catch(error){
      console.log(error);
    }

  };
  
  // 🔥 MAIN EFFECT (auth + user + data)
  React.useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      fetchUser();
      fetchTableData();
    }
  }, []);
   // 🔄 Reload table when needed
  React.useEffect(() => {
    if (reload) {
      fetchTableData();
    }
  }, [reload]);

  React.useEffect(() =>{
    const handleFocus = () =>{
      fetchTableData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <>
      {/* <PaymentButton/> */}
      {!user?.isPremium && <PaymentButton />}
      <FormContainer updateReloadState={updateReloadState} />
      <DataTable updateReloadState={updateReloadState} data={data}/> 
    </>
  );
};

export default Container;
