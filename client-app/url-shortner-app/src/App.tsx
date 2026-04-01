import './App.css'
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Container from './components/Container/Container';
import { Routes, Route } from 'react-router-dom';

//pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Logout from './pages/Logout';
import ProtectedRoute from './components/ProtectedRoute';
import AnalyticsPage from './pages/AnalyticsPage';
function App() {

  return (
    <>
      <Header/>

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        {/* <Route 
          path='/analytics/:shortUrl' 
          element={<AnalyticsPage/>
          
          }/> */}
        {/* <Route path='/dashboard' element={<Container/>}/>   */}
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute>
              <Container/>
            </ProtectedRoute>
          }/> 

          <Route 
          path='/analytics/:shortUrl' 
          element={
          <ProtectedRoute>          
              <AnalyticsPage/>                
          </ProtectedRoute>        
          }/>
          
        <Route path='/logout' element={<Logout/>}/>     
      </Routes>
      <Footer/>
    </>
  )
}

export default App;
