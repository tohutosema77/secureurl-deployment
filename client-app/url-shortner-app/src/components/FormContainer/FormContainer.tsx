import * as React from 'react';
import axios from 'axios';
import { serverUrl } from '../../helpers/Constants';

interface IFormContainerProps {
  updateReloadState: () => void;
}

const FormContainer: React.FunctionComponent<IFormContainerProps> = (props) => {
  const { updateReloadState } =props;
  const [fullUrl,setFullUrl]=React.useState<string>("");
  const [customUrl,setCustomUrl]=React.useState<string>("");
  //handlesubmit portiopn
  // const handleSubmit=async (e: React.FormEvent<HTMLFormElement>) =>{
  //   e.preventDefault();
  //   try {
  //     await axios.post(`${serverUrl}/shorturl`, {
  //       fullUrl: fullUrl
  //     });
  //     setFullUrl("");
  //     updateReloadState();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const token = localStorage.getItem("token");

  // React.useEffect(() =>{
  //   if (!localStorage.getItem("token")) {
  //     alert("Please login first");
  //   }
  // }, []);
  if (!token) {
    alert("Please login first");
    return;
  }
  const handleSubmit=async (e: React.FormEvent<HTMLFormElement>) =>{
    e.preventDefault();

    try {
      await axios.post(
        `${serverUrl}/short/shorturl`,
        {
          fullUrl: fullUrl,
          customUrl: customUrl
        },
        {
          headers:{
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setFullUrl("");
      setCustomUrl("");
      updateReloadState();
    } catch (error){
      console.log(error);
    }
  };
  return(
      <div className='container mx-auto p-2'>
          <div className='bg-banner my-8 rounded-xl bg-cover bg-center'>
            <div className='w-full h-full rounded-xl p-20 backdrop-brightness-50'>
              <h2 className="text-white text-4xl text-center pb-4 font-bold drop-shadow-lg">SecureURL – Authenticated URL Shortener</h2>
              <p className='text-white text-center pb-2 text-xl font-bold '>paste your link to shorten it.</p>
              <p className='text-white text-center pb-4 text-sm font-extralight'>free tool to shorten a URL or reduce link, Use our shortner to create a shortened & neat link making it easy to use.</p>
              <form onSubmit={handleSubmit}>
                <div className='flex'>
                  <div className='w-full space-y-3'>
                    {/* <div className='absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none text-slate-800'>urlshortner.link /</div>
                    Full URL */}
                    <input type="text" placeholder='Paste your long URL here' required 
                    // className='block w-full p-4 ps-32 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500'
                    className='block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg'
                    value={fullUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullUrl(e.target.value)}
                    />
                     {/* Custom URL */}
                     <div className='flex items-center border border-gray-300 rounded-lg bg-white'>
                      <span className='px-3 text-gray-500 text-sm'>secureurl.link /</span>
                      <input type="text"
                        placeholder='Custom name'
                        // className='block w-full mt-3 p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white'
                        className='flex-1 p-3 outline-none'
                        value={customUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setCustomUrl(e.target.value)}
                      />
                     </div>
                    
                    <button type="submit" 
                    // className='absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-lg border border-blue-700  focus:ring-4 focus:outline-none focus:ring-blue-300'
                    className='w-full bg-blue-700 text-white p-3 rounded-lg hover:bg-blue-800'
                    >
                      Shorten URL
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
          </div>
      </div>
  ) ;

}
export default FormContainer;

