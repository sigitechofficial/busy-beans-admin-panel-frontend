"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CiMenuBurger } from "react-icons/ci";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { BASE_URL } from "@/utilities/URL";
import { useDataContext } from "@/utilities/DataContext";

export default function QuickBooksLoginSuccess() {
  const router = useRouter();
  const [authState, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);

  const { toggle, setToggle } = useDataContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    const code = params.get("code");
    const realmId = params.get("realmId");

    if (state && code && realmId) {
      setAuthState(`QuickBooks login successful. State: ${state}`);
      localStorage.setItem("quickbooksState", state);
      // Call the callback API
      authenticateQuickbooksCallback(state, code, realmId);
    } else {
      setAuthState("Failed to log in to QuickBooks.");
    }
    setLoading(false);
  }, []);

  // API call to handle the callback after QuickBooks login
  const authenticateQuickbooksCallback = async (state, code, realmId) => {
    try {
      const fullUrl = window.location.href; 

      const res = await PostAPI(`${BASE_URL}qbo/auth/exchange`, {
        state,
        code,
        realmId,
        fullUrl, 
      });

      if (res.data.status === "success") {
        // Save access token and realmId in localStorage
        localStorage.setItem("accessTokenQbo", res.data.data.access_token);
        localStorage.setItem("realmId", res.data.data.realmId);
        
        // console.log("accessToken saved in localStorage:", localStorage.getItem("accessTokenQbo"));
        // console.log("realmId saved in localStorage:", localStorage.getItem("realmId"));

        setLoading(false);
        setAuthState("Successfully authenticated with QuickBooks.");
      } else {
        setLoading(false);
        setAuthState("Error during QuickBooks callback.");
      }
    } catch (error) {
      console.error("Error during QuickBooks callback:", error);
      setLoading(false);
      setAuthState("Error connecting to QuickBooks.");
    }
  };

  return (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
        </div>
      </div>

      <div
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#8F5D46",
          minHeight: "100vh",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#3E342C",
            borderRadius: "12px",
            padding: "40px",
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle glow effect */}
          <div
            style={{
              position: "absolute",
              inset: "-40%",
              background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              fontSize: "60px",
              marginBottom: "10px",
              filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))",
              animation: "pop 300ms ease-out",
            }}
          >
            ✅
          </div>

          <h1 style={{ margin: 0, fontSize: "28px" }}>QuickBooks Login Successful</h1>
          <p style={{ marginTop: "8px", opacity: 0.9 }}>{loading ? "Logging you in..." : authState}</p>

          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.12)",
              margin: "24px 0",
            }}
          />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => router.push("/")} style={btnStyle} aria-label="Back to Home">
              Back to Home
            </button>
          </div>

          <style>{`
            @keyframes pop {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            button:focus-visible, a:focus-visible {
              outline: 2px solid #D9C6BA; outline-offset: 2px;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  backgroundColor: "#8F5D46",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "transform 120ms ease, opacity 120ms ease",
  textDecoration: "none",
  display: "inline-block",
};
