"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StripeAccountConnected() {
  const pathName = usePathname();
  const router = useRouter();

  const handleDashboard = () => {
    const path = pathName.split("/");
    router.push(`https://${path[2].trim()}/`);
  };

  useEffect(() => {
    localStorage.setItem("isAccountConnected", true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-themeLight py-5">
      {/* main section start */}

      <div className="relative border border-theme rounded-xl bg-themeDark  w-11/12 sm:w-4/6 md:w-[70%] lg:w-3/5 xl:w-2/4 py-6 mx-auto flex flex-col items-center gap-y-4">
        <div className="w-60 md:w-72 lg:w-80">
          <img
            src="/images/logocoffee.png"
            alt="logo"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="space-y-6 w-11/12 xl:w-3/5">
          <p className="font-satoshi text-themeGreen font-black text-2xl lg:text-3xl text-center">
            Stripe Account Connected Successfully
          </p>

          <div>
            <button
              onClick={handleDashboard}
              className="font-medium rounded-xl bg-theme text-white w-full py-3"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
