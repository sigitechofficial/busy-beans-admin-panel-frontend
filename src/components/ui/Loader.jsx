// import { CirclesWithBar } from "react-loader-spinner";
import Spinner from "./Spinner";

export default function Loader() {
  return (
    <div className="bg-theme/90 w-full h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}
