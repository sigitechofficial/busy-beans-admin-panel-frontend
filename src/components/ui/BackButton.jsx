'use client'
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="flex justify-center items-center w-6 h-6 text-black rounded-full hover:bg-black hover:text-white duration-200"
      onClick={() => {
        router.back();
      }}
    >
      <FaArrowLeft />
    </button>
  );
}
