// src/components/layout/NavigationGuard.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile } from "../../store/slices/profileSlice";
import { toast } from "sonner";
import { permissionCheckData } from "../../api/ui-config-mock";
import path from "node:path";

export function PermissionCheck({ children }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: profile, loading } = useSelector((state) => state.profile);


    useEffect(() => {
        if (!profile || Object.keys(profile).length === 0) {
            dispatch(fetchProfile());
            return;
        }
        if (!loading && profile) {
            if (pathname === "/profile" || pathname === "/no-permission") {
                console.log("any one can access this page")
            }

            else if (permissionCheckData[pathname] && !profile?.permissions?.some(
                (perm) => perm.name === permissionCheckData[pathname]
            )) {
                toast.error("You don't have permission to access this page.");
                navigate("/no-permission", { replace: true });
            }
        }
    }, [profile, loading, navigate, dispatch, pathname]);


    return children;



}
