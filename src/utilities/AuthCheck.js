import { info_toaster } from "@/utilities/Toaster";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const setLoginStatus = (data) => {
  try {
    localStorage.setItem("loginStatus", data);
  } catch (err) {}
};
 
export const AuthCheck = () => {
  const router = useRouter();
  useEffect(() => {
    if (
      !localStorage.getItem("loginStatus") ||
      !localStorage.getItem("accessToken")
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("loginStatus");
      localStorage.removeItem("email");
      localStorage.removeItem("userType");
      localStorage.removeItem("userID");
      localStorage.removeItem("userName");
      router.push("/sign-in");
      info_toaster("Please login first !");
    }
  }, [router]);
};
