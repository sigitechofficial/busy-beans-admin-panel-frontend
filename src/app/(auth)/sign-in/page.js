// "use client"
import Link from "next/link";
import { Checkbox } from "primereact/checkbox";

export default function SignIn() {
  return (
    <div className="bg-signInBackgroundImage bg-cover min-h-screen flex items-center justify-center">
      <div className="grid grid-cols-2 w-3/5 backdrop-blur-md rounded-lg border border-theme [&>div]:px-14">
        {/* left side */}
        <div className=" flex flex-col justify-center">
          <div className="h-4/5 w-full flex items-center justify-center">
            <img
              src="/images/logo.png"
              alt="logo"
              className="object-contain w-full h-36"
            />
          </div>
          <p className="flex items-center justify-between font-switzer text-white text-sm font-normal">
            <Link href="">Terms of Services</Link>
            <Link href="">Privacy Policy</Link>
            <Link href="">Help & Suppport</Link>
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col py-16 border-l-2 border-theme gap-y-10">
          <h1 className="font-satoshi font-black text-white text-3xl">
            Sign In to Busy Bean
          </h1>

          <div className="space-y-6">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <label className="text-white font-medium font-satoshi">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="border border-inputBorder rounded-lg outline-none px-3 py-2"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-white font-medium font-satoshi">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  className="border border-inputBorder rounded-lg outline-none px-3 py-2"
                />
                <p className="text-white text-sm text-end font-normal">
                  Forgot Password?
                </p>
              </div>
              <div className="flex items-center gap-x-4 text-white font-inter font-normal">
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="adminLogin"
                    name="adminLogin"
                    value="adminLogin"
                    checked={true}
                  />
                  <label htmlFor="adminLogin" className="ml-2 font-inter">
                    Admin Login
                  </label>
                </div> 
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="supplierLogin"
                    name="supplierLogin"
                    value="supplierLogin"
                    checked={false}
                  />
                  <label htmlFor="supplierLogin" className="ml-2 font-inter">
                    Supplier Login
                  </label>
                </div>
              </div>
            </div>
            <div>
              <button className="bg-theme font-satoshi text-white py-2 rounded-lg w-full font-medium">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
