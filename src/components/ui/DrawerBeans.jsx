"use client";
// import { Drawer, Portal, CloseButton } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { RiSubtractFill } from "react-icons/ri";
import { BiPlus, BiTrash } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/utilities/URL";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

const DrawerBeans = ({ drawerOpen: open, setDrawerOpen: setOpen }) => {
  const router = useRouter();
  const [counter, setCounter] = useState(null);
  const [render, setRender] = useState(false);
  const [drawerScroll, setDrawerScroll] = useState(0);
  if (typeof window !== "undefined") {
    var cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  }
  const totalPrice = cartItems?.reduce((a, b) => {
    return Number(a) + Number(b?.price) * Number(b?.qty);
  }, 0);

  const handleCounterClick = (index) => {
    setCounter(index);
  };

  const drawerBodyRef = useRef(null);
  const handleDrawerScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    setDrawerScroll(scrollTop);
  };

  const handleItemClick = (type, id) => {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (type === "plus") {
      let updatedCart = cartItems.map((item) => {
        if (Number(item.productId) === id) {
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      });
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      setRender(!render);
    } else if (type === "minus") {
      let updatedCart = cartItems.map((item) => {
        if (Number(item.productId) === id && item.qty > 1) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      });
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      setRender(!render);
    } else if (type === "delete") {
      let updatedCart = cartItems.filter(
        (item) => Number(item.productId) !== id
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      setRender(!render);
    }
  };

  useEffect(() => {
    if (drawerBodyRef.current) {
      drawerBodyRef.current.addEventListener("scroll", handleDrawerScroll);
    }
    return () => {
      if (drawerBodyRef.current) {
        drawerBodyRef.current.removeEventListener("scroll", handleDrawerScroll);
      }
    };
  }, []);

  return (
    <div className="card">
      <Sidebar
        visible={open}
        position="right"
        onHide={() => setOpen(false)}
        className="rounded-tl-xl rounded-bl-xl bg-theme text-white"
      >

      </Sidebar>
    </div>
    // <Drawer.Root
    //   placement={"end"}
    //   size="md"
    //   open={open}
    //   onOpenChange={(e) => setOpen(e.open)}
    // >
    //   <Portal>
    //     <Drawer.Backdrop />
    //     <Drawer.Positioner>
    //       <Drawer.Content className="rounded-tl-xl rounded-bl-xl bg-theme text-white">
    //         <Drawer.Header
    //           className="rounded-tl-xl"
    //           p={0}
    //           boxShadow={
    //             drawerScroll > 100 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
    //           }
    //           transition="all 0.3s ease"
    //           position="absolute"
    //           top={drawerScroll > 100 ? "0" : "-60px"}
    //           left="0"
    //           right="0"
    //           backgroundColor="#3e342c"
    //           zIndex={10}
    //           opacity={drawerScroll > 100 ? 1 : 0}
    //           visibility={drawerScroll > 100 ? "visible" : "hidden"}
    //           height="70px"
    //           display="flex"
    //           alignItems="center"
    //           justifyContent="center"
    //         >
    //           {/* <Drawer.Title>Drawer Title</Drawer.Title> */}

    //           <p className="font-medium text-base">
    //             {false ? "Substitution" : "Your Order"}
    //           </p>
    //         </Drawer.Header>
    //         <Drawer.Body
    //           ref={drawerBodyRef}
    //           className="w-full !pb-0  custom-scrollbar"
    //           px={0}
    //           onScroll={handleDrawerScroll}
    //         >
    //           <div className="space-y-6 font-sf px-4 mb-28 bg-theme text-white">
    //             <div>
    //               <div className="flex justify-between items-center mb-10 mt-20 ">
    //                 <h2 className="text-[32px] font-black font-nunito text-theme-black-2">
    //                   Your Quotation
    //                 </h2>

    //                 <button
    //                   onClick={() => setOpen(false)}
    //                   className="absolute right-5 top-4 z-10 rounded-full bg-themeLight text-white w-10 h-10 text-xl flex justify-center items-center"
    //                 >
    //                   <IoMdClose className="text-2xl" />
    //                 </button>
    //               </div>

    //               <div className="flex justify-between my-3">
    //                 <h2 className="font-omnes  text-xl font-semibold ">
    //                   Order items
    //                 </h2>
    //               </div>

    //               <div className="">
    //                 <div className="h-3/5 overflow-y-auto">
    //                   {cartItems?.map((cartI, index) => (
    //                     <div
    //                       key={index}
    //                       className="font-sf relative flex sm:flex-row items-start rounded-2xl h-full mb-3"
    //                     >
    //                       <div className="flex justify-center sm:w-[150px] w-[72px] sm:h-[72px] h-[72px] rounded-2xl">
    //                         <img
    //                           src={BASE_URL + cartI?.image}
    //                           alt="cutlery"
    //                           className="w-full h-full rounded-md object-cover"
    //                         />
    //                       </div>
    //                       <div className="px-5 w-full font-sf">
    //                         <h3 className="capitalize font-semibold text-base">
    //                           {cartI?.name}
    //                         </h3>
    //                         <div className="capitalize text-sm font-light text-white">
    //                           <ul>
    //                             {cartI?.addOnsCat &&
    //                             cartI?.addOnsCat?.length > 0
    //                               ? cartI?.addOnsCat
    //                                   ?.filter(
    //                                     (ele) =>
    //                                       ele?.id ===
    //                                       cartI?.addOns?.find(
    //                                         (fil) =>
    //                                           fil?.collectionId === ele?.id
    //                                       )?.collectionId
    //                                   )
    //                                   ?.map((cat, key) => (
    //                                     <li key={key}>
    //                                       <span>{cat?.name}: </span>
    //                                       <br />
    //                                       {cartI?.addOns
    //                                         ?.filter(
    //                                           (fil) =>
    //                                             fil?.collectionId === cat?.id
    //                                         )
    //                                         ?.map((add, addKey) => (
    //                                           <div
    //                                             key={addKey}
    //                                             className="ml-2 mt-1"
    //                                           >
    //                                             {`${add?.qty}x ${add?.name} ${
    //                                               add?.total > 0
    //                                                 ? `(${add?.total}.00)`
    //                                                 : ""
    //                                             }`}
    //                                           </div>
    //                                         ))}
    //                                     </li>
    //                                   ))
    //                               : cartI?.addOns?.map((add, addKey) => (
    //                                   <li key={addKey}>
    //                                     <div className="ml-2 mt-1">
    //                                       {`${add?.qty}x ${add?.name} ${
    //                                         add?.total > 0
    //                                           ? `(${add?.total}.00)`
    //                                           : ""
    //                                       }`}
    //                                     </div>
    //                                   </li>
    //                                 ))}
    //                           </ul>
    //                         </div>
    //                         <div className="flex items-center justify-between">
    //                           <div className="flex items-center gap-x-3">
    //                             <span className="font-semibold text-sm text-white mt-1">
    //                               {parseFloat(
    //                                 Number(cartI?.price) * cartI?.qty
    //                               )}{" "}
    //                               {activeResData?.currencyUnit || "$"}
    //                             </span>
    //                           </div>
    //                         </div>
    //                       </div>
    //                       <div className="cursor-pointer mt-2 mr-1 rounded-full flex items-center justify-around text-white p-1 absolute bg-black right-0">
    //                         {counter === index ? (
    //                           <>
    //                             <button
    //                               onClick={() => {
    //                                 handleItemClick("minus", cartI?.productId);
    //                               }}
    //                               className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
    //                             >
    //                               <RiSubtractFill />
    //                             </button>

    //                             <span className="text-lg font-sf w-7 text-center">
    //                               {cartI?.qty}
    //                             </span>

    //                             <button
    //                               onClick={() => {
    //                                 handleItemClick("plus", cartI?.productId);
    //                               }}
    //                               className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
    //                             >
    //                               <BiPlus />
    //                             </button>

    //                             <button
    //                               onClick={() => {
    //                                 handleItemClick("delete", cartI?.productId);
    //                               }}
    //                               className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-red-600 hover:text-white duration-300"
    //                             >
    //                               <BiTrash />
    //                             </button>
    //                           </>
    //                         ) : (
    //                           <span
    //                             onClick={() => handleCounterClick(index)}
    //                             className="text-lg font-sf w-7 text-center"
    //                           >
    //                             {cartI?.qty}
    //                           </span>
    //                         )}
    //                       </div>
    //                     </div>
    //                   ))}
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </Drawer.Body>
    //         <Drawer.Footer px={0} py={2}>
    //           <>
    //             {cartItems?.length > 0 ? (
    //               <div
    //                 className="w-full text-center mt-4 px-4"
    //                 onClick={() => {
    //                   router.push("/checkout");
    //                   setOpen(false);
    //                 }}
    //               >
    //                 <button
    //                   className="bg-themeLight font-bold text-white rounded-full px-5 min-h-14 w-full flex items-center justify-between"
    //                   // onClick={handleCartPage}
    //                 >
    //                   <div className="flex space-x-4 items-center">
    //                     <div className="bg-white text-black text-sm  py-[1px] px-[7px] rounded-full">
    //                       {String(cartItems?.length).padStart(2)}
    //                     </div>
    //                     <p> Go to checkout </p>
    //                   </div>
    //                   ${totalPrice.toFixed(2)} {activeResData?.currencyUnit}
    //                 </button>
    //               </div>
    //             ) : (
    //               <div className="w-full text-center mt-4 mx-4">
    //                 <button className="bg-black  font-bold text-white rounded-full px-5 min-h-14 w-full    `` ">
    //                   Send Quotation
    //                 </button>
    //               </div>
    //             )}
    //           </>
    //         </Drawer.Footer>
    //         <Drawer.CloseTrigger asChild>
    //           {/* Keep the Chakra CloseButton for consistent styling */}
    //           <CloseButton size="sm" />
    //         </Drawer.CloseTrigger>
    //       </Drawer.Content>
    //     </Drawer.Positioner>
    //   </Portal>
    // </Drawer.Root>
  );
};

export default DrawerBeans;
