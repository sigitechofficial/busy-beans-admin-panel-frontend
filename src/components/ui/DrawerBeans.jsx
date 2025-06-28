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
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import Select from "react-select";
import { drawerSelectStyles, selectStyles2 } from "@/utilities/SelectStyle";
import { RxCross2 } from "react-icons/rx";
import MiniLoader from "./MiniLoader";
import { MdInsertComment, MdOutlineConfirmationNumber } from "react-icons/md";

const DrawerBeans = ({
  drawerOpen: open,
  setDrawerOpen: setOpen,
  setQuotationData,
  type,
}) => {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
  }
  const options = [];
  const paymentMethodOptions = [
    { label: "COD", value: "cod" },
    { label: "Cheque", value: "cheque" },
    { label: "Card", value: "card" },
  ];
  const orderFrequencyOptions = [
    { label: "Once", value: "just-onces" },
    { label: "Weekly", value: "weekly" },
    { label: "Every Two Weeks", value: "every-two-weeks" },
    { label: "Every Four Weeks", value: "every-four-weeks" },
  ];
  const [addressOptions, setAddressOptions] = useState([]);
  const [counter, setCounter] = useState(null);
  const [render, setRender] = useState(false);
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState(true);
  const [loader, setLoader] = useState(false);
  const [order, setOrder] = useState({
    note: "",
    paymentMethod: "",
    poNumber: "",
    orderFrequency: "",
    addressId: "",
    userId: "",
  });

  if (typeof window !== "undefined") {
    var cartItems =
      type === "createOrder"
        ? JSON.parse(localStorage.getItem("createOrderData")) || []
        : JSON.parse(localStorage.getItem("quotationData")) || [];
  }
  const totalPrice = cartItems?.reduce((a, b) => {
    return Number(a) + Number(b?.price) * Number(b?.qty);
  }, 0);

  const totalWeight = cartItems?.reduce((a, b) => {
    return Number(a) + Number(b?.quantity) * Number(b?.qty);
  }, 0);

  const { data } = GetAPI(
    `api/v1/admin/customer-management/customer-list/sale-rep-id/${userID}`
  );

  data?.data?.data?.map((user) =>
    options.push({ value: user?.email, label: user?.email })
  );

  const handleCounterClick = (index) => {
    setCounter(index);
  };

  const drawerBodyRef = useRef(null);

  const handleDrawerScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    setDrawerScroll(scrollTop);
  };

  const handleItemClick = (actionType, id) => {
    if (actionType === "plus") {
      let updatedCart = cartItems.map((item) => {
        if (Number(item.id) === id) {
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      });
      type === "createOrder"
        ? localStorage.setItem("createOrderData", JSON.stringify(updatedCart))
        : localStorage.setItem("quotationData", JSON.stringify(updatedCart));
      setQuotationData(updatedCart);
      setRender(!render);
    } else if (actionType === "minus") {
      let updatedCart = cartItems.map((item) => {
        if (Number(item.id) === id && item.qty > 1) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      });
      type === "createOrder"
        ? localStorage.setItem("createOrderData", JSON.stringify(updatedCart))
        : localStorage.setItem("quotationData", JSON.stringify(updatedCart));
      setQuotationData(updatedCart);
      setRender(!render);
    } else if (actionType === "delete") {
      let updatedCart = cartItems.filter((item) => Number(item.id) !== id);
      type === "createOrder"
        ? localStorage.setItem("createOrderData", JSON.stringify(updatedCart))
        : localStorage.setItem("quotationData", JSON.stringify(updatedCart));
      setQuotationData(updatedCart);
      setRender(!render);
    }
  };

  const handleCreateOrderData = (createOrderData) => {
    const updatedCart = [];
    createOrderData?.map((item) =>
      updatedCart.push({
        categoryId: item?.categoryId,
        createdAt: item?.createdAt,
        deleted: false,
        desc: item?.desc,
        productId: item?.id,
        image: item?.image,
        name: item?.name,
        price: item?.price,
        qty: item?.qty,
        quantity: item?.quantity,
        status: true,
        unit: item?.unit,
        updatedAt: item?.updatedAt,
        weight: item?.weight,
        wholesalePrice: item?.wholesalePrice,
      })
    );
    return updatedCart;
  };

  const handleSendQuotation = async () => {
    if (type === "createOrder") {
      console.log("i am inside this");
      const createOrderData = JSON.parse(
        localStorage.getItem("createOrderData")
      );
      console.log(
        "🚀 ~ handleSendQuotation ~ createOrderData:",
        createOrderData
      );
      if (createOrderData?.length === 0) {
        info_toaster("No Product is selected");
      } else if (!email?.trim()) {
        info_toaster("Email cannot be empty");
      } else if (!order?.addressId) {
        info_toaster("Address cannot be empty");
      } else if (!order?.paymentMethod) {
        info_toaster("select payment method");
      } else if (!order?.orderFrequency) {
        info_toaster("Selectorder frequency");
      }
      // else if (!order?.note) {
      //   info_toaster("Note cannot be empty");
      // }
      else {
        setLoader(true);
        try {
          const res = await PostAPI(
            `api/v1/admin/sales-rep/book-new-order/${userID}`,
            {
              //sales rep id in route
              order: {
                totalBill: totalPrice,
                subTotal: totalPrice,
                discountPrice: 0,
                discountPercentage: 0,
                itemsPrice: totalPrice,
                vat: 0.0,
                totalWeight: totalWeight,
                note: order?.note,
                paymentMethod: order?.paymentMethod,
                poNumber: order?.poNumber,
                frequency: order?.orderFrequency, //  'just-onces','weekly','every-two-weeks','every-four-weeks',
                addressId: order?.addressId,
                userId: order?.userId,
              },
              items: handleCreateOrderData(createOrderData),
            }
          );
          if (res?.data?.status === "success") {
            success_toaster("order Created successfully");
            setLoader(false);
            localStorage.setItem("createOrderData", JSON.stringify([]));
            setQuotationData([]);
            setOrder({ ...order, note: "" });
            setOpen(false);
          } else {
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
        } catch (error) {
          ErrorHandler(error);
          setLoader(false);
        }
      }
    } else {
      if (!email) {
        info_toaster("Email cannot be empty");
      } else if (cartItems.length === 0) {
        info_toaster("Product cannot be empty");
      } else {
        setLoader(true);
        try {
          const res = await PostAPI("api/v1/admin/send-quotation", {
            email: [email],
            order: {
              totalBill: totalPrice,
              subTotal: totalPrice,
              itemsPrice: totalPrice,
              vat: 0.0,
              totalWeight: totalWeight,
            },
            items: cartItems,
          });
          if (res?.data?.status === "success") {
            setOpen(false);
            success_toaster("Quotation send Successfully");
            type === "createOrder"
              ? localStorage.setItem("createOrderData", JSON.stringify([]))
              : localStorage.setItem("quotationData", JSON.stringify([]));
            setQuotationData([]);
            setEmail("");
            setEmailType(true);
          } else {
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
        } catch (error) {
          ErrorHandler(error);
        } finally {
          setLoader(false);
        }
      }
    }
  };

  const handleEmail = (email) => {
    const addressList = [];
    setEmail(email);
    const selectedEmail = data?.data?.data?.find(
      (customer) => customer?.email === email
    );
    setOrder({
      ...order,
      userId: selectedEmail?.id,
    });
    selectedEmail?.addresses?.map((address) =>
      addressList.push({
        value: address?.id,
        label: address?.companyaddress,
      })
    );
    setAddressOptions([...addressList]);
  };

  // useEffect(() => {
  //   if (drawerBodyRef.current) {
  //     drawerBodyRef.current.addEventListener("scroll", handleDrawerScroll);
  //   }
  //   return () => {
  //     if (drawerBodyRef.current) {
  //       drawerBodyRef.current.removeEventListener("scroll", handleDrawerScroll);
  //     }
  //   };
  // }, []);

  return (
    <div className="card relative">
      <Sidebar
        visible={open}
        position="right"
        onHide={() => setOpen(false)}
        className="rounded-tl-xl rounded-bl-xl bg-theme text-white w-[512px]"
      >
        <div className="px-4 space-y-6">
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-[32px] font-black font-nunito text-theme-black-2">
                {type === "createOrder" ? "Create Order" : "Send Quotation"}
              </h2>
            </div>
          </div>
          {loader ? (
            <MiniLoader />
          ) : (
            <div className="relative space-y-6 font-sf pb-20 bg-theme text-white">
              {type === "createOrder" ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-y-2">
                    <label className="text-white font-medium font-satoshi">
                      Email
                    </label>
                    <div className="flex items-center gap-x-2 min-h-full">
                      <Select
                        placeholder="Select email"
                        className="w-full"
                        styles={drawerSelectStyles}
                        options={options}
                        onChange={(e) => {
                          // setEmail(e.value);
                          handleEmail(e.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2 min-h-full">
                    <Select
                      placeholder="Select Address"
                      className="w-full"
                      styles={drawerSelectStyles}
                      options={addressOptions}
                      onChange={(e) => {
                        setOrder({ ...order, addressId: e.value });
                      }}
                    />
                  </div>
                  <div>
                    <Select
                      placeholder="Select Payment Method"
                      className="w-full"
                      styles={drawerSelectStyles}
                      options={paymentMethodOptions}
                      onChange={(e) => {
                        setOrder({ ...order, paymentMethod: e.value });
                      }}
                    />
                  </div>
                  <div>
                    <Select
                      placeholder="Select Order Frequency"
                      className="w-full"
                      styles={drawerSelectStyles}
                      options={orderFrequencyOptions}
                      onChange={(e) => {
                        setOrder({ ...order, orderFrequency: e.value });
                      }}
                    />
                  </div>

                  <div>
                    <div className="w-full font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-white hover:border-goldenLight focus-within:border-goldenLight rounded-t">
                      <MdInsertComment size={24} />
                      <div className="relative w-full">
                        <input
                          type="text"
                          id="courier-note"
                          className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${
                            order?.note ? "placeholder-transparent" : ""
                          }`}
                          value={order?.note}
                          onChange={(e) =>
                            setOrder({ ...order, note: e.target.value })
                          }
                        />
                        <label
                          htmlFor="courier-note"
                          className={`absolute left-0 top-4 placeholder:text-themeLight transition-all ${
                            order?.note
                              ? "top-[5px] text-[13px] peer-focus:text-goldenLight"
                              : "peer-placeholder-shown:top-5 peer-placeholder-shown:text-goldenLight peer-focus:top-[7px] peer-focus:text-[13px] peer-focus:text-goldenLight"
                          }`}
                        >
                          {order?.note
                            ? "Note for the supplier (optional)"
                            : "Add note for the supplier (optional)"}
                        </label>
                      </div>
                    </div>
                    <div className="w-full font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-white hover:border-goldenLight focus-within:border-goldenLight rounded-b">
                      <MdOutlineConfirmationNumber size={24} />
                      <div className="relative w-full">
                        <input
                          type="text"
                          id="poNumber"
                          className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${
                            order?.note ? "placeholder-transparent" : ""
                          }`}
                          value={order?.poNumber}
                          onChange={(e) =>
                            setOrder({ ...order, poNumber: e.target.value })
                          }
                        />
                        <label
                          htmlFor="poNumber"
                          className={`absolute left-0 top-4 placeholder:text-themeLight transition-all ${
                            order?.poNumber
                              ? "top-[5px] text-[13px] peer-focus:text-goldenLight"
                              : "peer-placeholder-shown:top-5 peer-placeholder-shown:text-goldenLight peer-focus:top-[7px] peer-focus:text-[13px] peer-focus:text-goldenLight"
                          }`}
                        >
                          {order?.poNumber
                            ? "Place Order Number"
                            : "Add Place Order Number (optional)"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-y-2">
                  <label className="text-white font-medium font-satoshi">
                    Email
                  </label>
                  <div className="flex items-center gap-x-2 min-h-full">
                    {emailType ? (
                      <Select
                        placeholder="Select email"
                        className="w-full"
                        styles={drawerSelectStyles}
                        options={options}
                        onChange={(e) => {
                          setEmail(e.value);
                        }}
                      />
                    ) : (
                      <input
                        type="email"
                        name="email"
                        autoComplete="off"
                        value={email}
                        placeholder="Enter Email"
                        className="border w-full border-themeLight text-themeLight placeholder:text-themeLight rounded-[4px] outline-none px-2.5 py-3"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("");
                        setEmailType(!emailType);
                      }}
                      className={`${
                        emailType ? "w-40" : "w-auto"
                      } h-12 bg-white text-black px-[7px] rounded-md`}
                    >
                      {emailType ? "Custom Email" : <RxCross2 size={32} />}
                    </button>
                  </div>
                </div>
              )}

              <p className="font-medium text-base">Order Details</p>

              <div className="">
                {cartItems?.length > 0 ? (
                  <div className="h-3/5 overflow-y-auto">
                    {cartItems?.map((cartI, index) => (
                      <div
                        key={index}
                        className="font-sf relative flex sm:flex-row items-start rounded-2xl h-full mb-3"
                      >
                        <div className="flex justify-center sm:min-w-[100px] min-w-[72px] sm:h-[72px] h-[72px] rounded-2xl">
                          <img
                            src={BASE_URL + cartI?.image}
                            alt="cutlery"
                            className="w-full h-full rounded-md object-cover"
                          />
                        </div>
                        <div className="px-5 w-full font-sf">
                          <h3 className="capitalize font-semibold text-base break-all">
                            {cartI?.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-x-3">
                              <span className="font-semibold text-sm text-white mt-1">
                                {"$ "}
                                {parseFloat(
                                  Number(cartI?.price) * Number(cartI?.qty)
                                )}{" "}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="cursor-pointer mt-2 mr-1 rounded-full flex items-center justify-around text-white p-1 relative bg-black right-0">
                          {counter === index ? (
                            <div className="flex">
                              <button
                                onClick={() => {
                                  handleItemClick("minus", cartI?.id);
                                }}
                                className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                              >
                                <RiSubtractFill />
                              </button>
                              <span className="text-lg font-sf w-7 text-center">
                                {cartI?.qty}
                              </span>
                              <button
                                onClick={() => {
                                  handleItemClick("plus", cartI?.id);
                                }}
                                className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                              >
                                <BiPlus />
                              </button>
                              <button
                                onClick={() => {
                                  handleItemClick("delete", cartI?.id);
                                }}
                                className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-red-600 hover:text-white duration-300"
                              >
                                <BiTrash />
                              </button>
                            </div>
                          ) : (
                            <span
                              onClick={() => handleCounterClick(index)}
                              className="text-lg font-sf w-7 text-center"
                            >
                              {cartI?.qty}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-red-500 ">
                    No Item is Selected !
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-[30px] py-5 flex justify-center bg-theme w-[452px]">
            <button
              className="bg-themeLight font-bold text-white rounded-[4px] px-5 min-h-14 w-full flex items-center justify-between"
              onClick={handleSendQuotation}
            >
              <div className="flex space-x-4 items-center">
                <div className="bg-white text-black text-sm py-[1px] px-[7px] rounded-full">
                  {String(cartItems?.length).padStart(2)}
                </div>
                <p>
                  {type === "createOrder" ? "Create Order" : "Send Quotation"}
                </p>
              </div>
              ${totalPrice?.toFixed(2)}
            </button>
          </div>
        </div>
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
