import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSelfCall } from "@/store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute = ({
  children,
  redirectPath = "/",
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading, isGuest } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !loading && !initialCheckDone && !isGuest) {
        await dispatch(getSelfCall());
      }
      setInitialCheckDone(true);
    };
    checkAuth();
  }, []);

  if (!initialCheckDone || loading) {
    return <>Loading</>;
  }

  if (!isGuest && (!user || !isAuthenticated)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
