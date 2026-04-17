import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedCompanyRoute = ({ children }: ProtectedRouteProps) => {
    const token = localStorage.getItem("companyToken");

    if (!token) {
        return <Navigate to="/company/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedCompanyRoute;
