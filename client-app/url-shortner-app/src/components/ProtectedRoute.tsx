import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: any) => {

  console.log("ProtectedRoute token:", localStorage.getItem("token"));
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;