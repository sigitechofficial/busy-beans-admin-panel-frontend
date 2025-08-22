"use client";
import StockCard from "@/components/ui/StockCard";
import { Dialog } from "primereact/dialog";
import { LuImageUp } from "react-icons/lu";
import { RiFileDownloadLine } from "react-icons/ri";
import Select from "react-select";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";
import { useState } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { BASE_URL } from "@/utilities/URL";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import Switch from "react-switch";
import { PatchAPI } from "@/utilities/PatchAPI";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";

export default function Stock() {
  const [filterId, setFilterId] = useState("");

  const url = filterId
    ? `api/v1/admin/product?categoryId=${filterId}`
    : `api/v1/admin/product`;
  const { data, reFetch } = GetAPI(url, "product");

  const { data: category, reFetch: categoryRefetch } = GetAPI(
    "api/v1/admin/category"
  );

  const { data: suppliersRes, reFetch: reFetchSuppliers } = GetAPI(
    "api/v1/admin/supplier?status=1"
  );

  const supplierList = suppliersRes?.data?.data ?? suppliersRes?.data ?? [];

  const [supplierSkus, setSupplierSkus] = useState({});

  const handleSupplierSkuChange = (supplierId, value) => {
    setSupplierSkus((prev) => ({ ...prev, [supplierId]: value }));
  };

  const getSupplierAndSkusPayload = () =>
    Object.entries(supplierSkus)
      .filter(([, sku]) => (sku ?? "").trim().length)
      .map(([supplierId, supplierSku]) => ({
        supplierId: Number(supplierId),
        supplierSku: supplierSku.trim(),
      }));

  const catOptions = [];
  category?.data?.data?.map((item) => {
    catOptions.push({ value: item?.id, label: item?.name });
  });

  const [productDetail, setProductDetail] = useState({
    name: "",
    quantity: "",
    unit: "",
    image: "",
    price: "",
    desc: "",
    category: "",
    wholesalePrice: "",
    productCode: "",
    sku: "",
    grind: "",
    weight: "",
  });
  const [productID, setProductID] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [modal, setModal] = useState("");
  const [loader, setLoader] = useState("");

  const parseNum = (v) => {
    if (v === null || v === undefined) return NaN;
    if (typeof v === "number") return v;
    const s = String(v).replace(/[^\d.-]/g, "").trim();
    if (s === "" || s === "." || s === "-" || s === "-.") return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const validateProduct = (mode) => {
    const name = (productDetail?.name ?? "").trim();
    const quantityNum = parseNum(productDetail?.quantity);
    const unit = productDetail?.unit;
    const priceNum = parseNum(productDetail?.price);
    const weightNum = parseNum(productDetail?.weight);
    const wholesaleNum = parseNum(productDetail?.wholesalePrice);
    const desc = (productDetail?.desc ?? "").trim();
    const categoryVal = productDetail?.category?.value;

    if (name === "") return "Product Name cannot be empty";

    if (!Number.isFinite(quantityNum)) return "Invalid Product quantity";
    if (!unit) return "Product unit cannot be empty";

    if (!Number.isFinite(priceNum)) return "Invalid Product price";
    if (!Number.isFinite(weightNum)) return "Invalid Product weight";
    if (!Number.isFinite(wholesaleNum)) return "Invalid whole sale price";

    if (desc.length === 0) return "Product description cannot be empty";
    if (!categoryVal) return "Please select a category";

    if (wholesaleNum > priceNum) {
      return "Whole Sale Price cannot be greater than Actual Price";
    }

    if (mode === "add" && !productDetail?.image) {
      return "Product image cannot be empty";
    }

    return null;
  };

  const handleChange = (e) => {
    setProductDetail({ ...productDetail, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    const image = document.querySelector(".image");
    image.click();
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductDetail({ ...productDetail, image: file });
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL);
    }
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", productDetail?.name);
    formData.append("quantity", String(parseNum(productDetail?.quantity) ?? ""));
    formData.append("unit", productDetail?.unit?.value);
    formData.append("price", String(parseNum(productDetail?.price) ?? ""));
    formData.append("weight", String(parseNum(productDetail?.weight) ?? ""));
    formData.append(
      "wholesalePrice",
      String(parseNum(productDetail?.wholesalePrice) ?? "")
    );
    formData.append("desc", productDetail?.desc);
    if (productDetail?.image instanceof File) {
      formData.append("image", productDetail?.image);
    }
    formData.append("categoryId", productDetail?.category?.value);
    formData.append("productCode", productDetail?.productCode ?? "");
    formData.append("sku", productDetail?.sku ?? "");
    formData.append("grind", productDetail?.grind ?? "");
    const supplierPayload = getSupplierAndSkusPayload();
    formData.append("supplierAndSkus", JSON.stringify(supplierPayload));
    return formData;
  };

  const handleStock = async (e) => {
    e.preventDefault();

    if (modal === "add") {
      const err = validateProduct("add");
      if (err) {
        info_toaster(err);
        return;
      }
      const formData = buildFormData();
      setLoader("add");
      try {
        const res = await PostAPI("api/v1/admin/product", formData, "product");
        if (res?.data?.status === "success") {
          success_toaster("Product Added Successfully");
          setProductDetail({
            name: "",
            quantity: "",
            unit: "",
            image: "",
            category: "",
            weight: "",
            productCode: "",
            sku: "",
            grind: "",
            price: "",
            wholesalePrice: "",
            desc: "",
          });
          setModal("");
          setLoader("");
          reFetch();
          setImagePreview("");
          setSupplierSkus({});
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader("");
      }
    } else if (modal === "edit") {
      const err = validateProduct("edit");
      if (err) {
        info_toaster(err);
        return;
      }
      setLoader("edit");
      const formData = buildFormData();
      try {
        const res = await PatchAPI(`api/v1/admin/product/${productID}`, formData, "product");
        if (res?.data?.status === "success") {
          success_toaster("Product Updated Successfully");
          setProductDetail({
            name: "",
            quantity: "",
            unit: "",
            image: "",
            weight: "",
            productCode: "",
            sku: "",
            grind: "",
            price: "",
            wholesalePrice: "",
            desc: "",
            category: "",
          });
          setModal("");
          setLoader("");
          reFetch();
          setImagePreview("");
          setSupplierSkus({});
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader("");
      }
    } else {
      setLoader("delete");
      try {
        const res = await DeleteAPI(`api/v1/admin/product/${productID}`, "product");
        if (res?.data?.status === "success") {
          success_toaster("Product Deleted Successfully");
          reFetch();
          setModal("");
          setLoader("");
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader("");
      }
    }
  };

  const handleCancel = () => {
    setProductDetail({
      name: "",
      quantity: "",
      weight: "",
      unit: "",
      image: "",
      price: "",
      desc: "",
      productCode: "",
      sku: "",
      grind: "",
      wholesalePrice: "",
      category: "",
    });
    setModal("");
    setSupplierSkus({});
    setImagePreview("");
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/product/${id}`, {
        status: !status,
      }, "product");
      if (res?.data?.status === "success") {
        success_toaster("Status updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleCategory = (id) => {
    const categoryData = category?.data?.data.find((cat) => cat?.id === id);
    return { value: categoryData?.id ?? "", label: categoryData?.name ?? "" };
  };

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name" },
    { field: "quantity", header: "Quantity" },
    { field: "weight", header: "Weight" },
    { field: "price", header: "Price ($)" },
    { field: "wholesalePrice", header: "Whole Sale Price ($)" },
    { field: "productCode", header: "Product Code" },
    { field: "sku", header: "SKU" },
    { field: "grind", header: "Grind" },
    { field: "image", header: "Image" },
    // {
    //   field: "currentStatus",
    //   header: "Current Status",
    // },
    {
      field: "changeStatus",
      header: "Change Status",
    },
    { field: "action", header: "Action" },
  ];

  const openEditModal = async (id) => {
    try {
      setLoader("prefill");
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : "";
      const res = await fetch(`${BASE_URL}api/v1/admin/product/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json", 
          "feature": "product", 
          ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
      });
      const json = await res.json();

      if (json?.status !== "success") {
        throw new Error(json?.message || "Failed to load product");
      }

      const p = json?.data?.product;

      const catVal = handleCategory(p?.categoryId)?.value
        ? handleCategory(p?.categoryId)
        : { value: p?.categoryId, label: "" };

      setProductDetail({
        name: p?.name ?? "",
        category: catVal,
        quantity: p?.quantity ?? "",
        unit:
          p?.unit === "lbs"
            ? { value: "lbs", label: "LBS" }
            : p?.unit
            ? { value: p?.unit, label: p?.unit }
            : "",
        image: p?.image ?? "",
        price: p?.price ?? "",
        weight: p?.weight ?? "",
        wholesalePrice: p?.wholesalePrice ?? "",
        desc: p?.desc ?? "",
        productCode: p?.productCode ?? "",
        sku: p?.sku ?? "",
        grind: p?.grind && p?.grind !== "null" ? p?.grind : "",
      });

      setProductID(p?.id);
      setImagePreview(p?.image ? BASE_URL + p.image : "");

      setSupplierSkus(
        Array.isArray(p?.skuSuppliers)
          ? p.skuSuppliers.reduce((acc, s) => {
              if (s?.supplierId) acc[s.supplierId] = s?.supplierSku ?? "";
              return acc;
            }, {})
          : {}
      );

      setModal("edit");
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setLoader("");
    }
  };

  const datas = [];
  data?.data?.data?.map((prod, i) => {
    return datas.push({
      sl: i + 1,
      name: prod?.name,
      quantity: prod?.quantity,
      price: "$" + prod?.price,
      weight: prod?.weight ? prod.weight + " lbs" : "",
      wholesalePrice: "$" + (prod?.wholesalePrice ?? ""),
      productCode: prod?.productCode ?? "",
      sku: prod?.sku ?? "",
      grind: prod?.grind && prod?.grind !== "null" ? prod?.grind : "",
      image: (
        <img
          src={BASE_URL + prod?.image}
          alt={prod?.image}
          className="w-20 h-12 object-contain"
        />
      ),
      // currentStatus: (
      //   <div>
      //     {prod?.status ? (
      //       <div className="w-24 bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
      //         Active
      //       </div>
      //     ) : (
      //       <div className="w-24 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
      //         Inactive
      //       </div>
      //     )}
      //   </div>
      // ),
      changeStatus: (
        <label className="flex items-center gap-2">
          <div>
            {prod?.status ? (
              <div className="w-max text-xs bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
                Active
              </div>
            ) : (
              <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                Inactive
              </div>
            )}
          </div>
          <Switch
            onChange={() => {
              handleStatus(prod?.id, prod?.status);
            }}
            checked={prod?.status}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#86644c"
            onHandleColor="#fff"
            className="react-switch"
            boxShadow="none"
          />
        </label>
      ),
      action: (
        <div className="flex gap-x-2">
          <button
            className="border border-theme rounded-md p-2 text-theme"
            onClick={() => openEditModal(prod?.id)}
          >
            <FaEdit size={24} />
          </button>
          <button
            className="border border-red-400 rounded-md p-2 text-red-400"
            onClick={() => {
              setProductID(prod?.id);
              setModal("delete");
            }}
          >
            <MdDelete size={24} />
          </button>
        </div>
      ),
    });
  });
  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w=[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Inventory Management
          </h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          <li
            onClick={() => {
              setSupplierSkus({});
              setModal("add");
            }}
          >
            New Product
          </li>
          <li>Import</li>
          <li>Export</li>
        </ul>
      </div>
      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        {/* <div className="space-y-4"> */}
        {/* <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Inventory Managment
            </h2>

            <Select
              placeholder="Filters"
              className="w-40"
              styles={selectStyles}
            />
            <div className="flex items-center gap-x-4">
              <div>
                <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
                  <RiFileDownloadLine size={24} />
                  <span className="font-nunito text-black">Download CSV</span>
                </button>
              </div>
            </div>
          </div> */}
        {/* <div className="flex justify-end">
            <button
              onClick={() => setModal("add")}
              className="rounded-lg font-inter font-medium text-white px-10 py-2.5 sm:py-4 bg-theme"
            >
              + Add Stock
            </button>
          </div> */}
        {/* </div> */}
        <div className="w-72 ml-auto">
          <Select
            placeholder="Select Category"
            options={catOptions}
            className="w-full text-black"
            styles={selectStyles2}
            onChange={(e) => setFilterId(e?.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Products"
            desc={data?.data?.data?.length}
          />
          {/* <ManagementTab title="Total Countries" desc="5000" /> */}
          {/* <ManagementTab title="Total Cities" desc="55000" /> */}
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
          />
        </div>

         {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {data?.data?.data?.map((item, i) => (
          <StockCard
            key={i}
            itemName={item?.name}
            quantity={item?.quantity}
            unit={item?.unit}
            imageURL={item?.image}
          />
        ))}
      </div> */}
        {/* Modal */}
        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          // style={{ width: "40vw" }}
          // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
          className="font-nunito w-[80%] lg:w-[40vw]"
          onHide={handleCancel}
          header={
            <div className="font-nunito font-bold lg:text-2xl text-center">
              {modal === "add"
                ? "Add"
                : modal === "edit"
                ? "Update"
                : modal === "delete"
                ? "Delete"
                : ""}{" "}
              Stock/ Inventory
            </div>
          }
        >
          {loader === "add" || loader === "edit" || loader === "delete" || loader === "prefill" ? (
            <MiniLoader />
          ) : (
            <form
              onSubmit={handleStock}
              className="space-y-4 flex flex-col items-center"
            >
              {/* header */}
              {modal !== "delete" && (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="overflow-hidden rounded-xl border border-tabBorderColor border-opacity-40 size-28 flex items-center justify-center"
                >
                  <input
                    type="file"
                    name="name"
                    className="image hidden"
                    onChange={handleImage}
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="product image"
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <LuImageUp size={"100"} color="rgba(0, 0, 0, 0.6)" />
                  )}
                </button>
              )}

              {/* body */}
              <div className="w-full space-y-4">
                {modal === "delete" ? (
                  <p className="text-labelColor font-nunito font-medium text-lg text-center">
                    Are you sure you want to delete this Stock ?
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-y-2 w-full">
                      <label className="text-labelColor font-medium font-satoshi">
                        Item Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productDetail?.name}
                        onChange={handleChange}
                        placeholder="Enter Item Name"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>

                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Description
                      </label>
                      <input
                        type="text"
                        name="desc"
                        value={productDetail?.desc}
                        onChange={handleChange}
                        placeholder="Enter Description"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>

                    <div className="flex flex-col gap-y-2 w-full">
                      <label className="text-labelColor font-medium font-satoshi">
                        Category
                      </label>
                      {/* <input
                        type="text"
                        name="unit"
                        value={productDetail?.unit}
                        onChange={handleChange}
                        placeholder="Enter unit"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      /> */}
                      <Select
                        placeholder="Category"
                        className="w-full"
                        value={productDetail?.category}
                        styles={selectStyles2}
                        options={catOptions}
                        onChange={(e) => {
                          setProductDetail({ ...productDetail, category: e });
                        }}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Price($)
                        </label>
                        <input
                          type="text"
                          name="price"
                          min="0"
                          value={productDetail?.price}
                          onChange={handleChange}
                          placeholder="Enter price"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                        <div
                          className={`text-red-600 space-y-1 pb-1 ${
                            !/^\d*\.?\d*$/.test(productDetail?.price ?? "")
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                          <p>Invalid Price</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Whole Sale Price($)
                        </label>
                        <input
                          type="text"
                          name="wholesalePrice"
                          min="0"
                          value={productDetail?.wholesalePrice}
                          onChange={handleChange}
                          placeholder="Enter whole sale price"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                        <div
                          className={`text-red-600 space-y-1 pb-1 ${
                            !/^\d*\.?\d*$/.test(
                              productDetail?.wholesalePrice ?? ""
                            )
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                          <p>Invalid whole sale price</p>
                        </div>
                        {/* <Select
                  placeholder="Kg"
                  className="w-full"
                  styles={selectStyles2}
                /> */}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-y-4 gap-x-6">
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Product Code
                        </label>
                        <input
                          type="text"
                          name="productCode"
                          min="0"
                          value={productDetail?.productCode}
                          onChange={handleChange}
                          placeholder="Enter Product Code"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          min="0"
                          value={productDetail?.sku}
                          onChange={handleChange}
                          placeholder="Enter SKU"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Grind
                        </label>
                        <input
                          type="text"
                          name="grind"
                          min="0"
                          value={productDetail?.grind}
                          onChange={handleChange}
                          placeholder="Enter Grind"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-y-4 gap-x-6">
                      <div className="flex flex-col gap-y-2">
                        <label className="text-labelColor font-medium font-satoshi">
                          Quanity
                        </label>
                        <input
                          type="text"
                          name="quantity"
                          min="0"
                          value={productDetail?.quantity}
                          onChange={handleChange}
                          placeholder="Enter Quantity"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                        <div
                          className={`text-red-600 space-y-1 pb-1 ${
                            !/^\d*\.?\d*$/.test(productDetail?.quantity ?? "")
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                          <p>Invalid Quantity</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <label className="text-labelColor font-medium font-satoshi">
                          Weight
                        </label>
                        <input
                          type="text"
                          name="weight"
                          min="0"
                          value={productDetail?.weight}
                          onChange={handleChange}
                          placeholder="Enter Weight"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                        {/* <div
                        className={`text-red-600 space-y-1 pb-1 ${
                          !/^\d*\.?\d*$/?.test(productDetail?.weight)
                            ? "block"
                            : "hidden"
                        }`}
                      >
                        <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                        <p>Invalid Weight</p>
                      </div> */}
                      </div>

                      <div className="flex flex-col gap-y-2 w-full">
                        <label className="text-labelColor font-medium font-satoshi">
                          Units
                        </label>
                        <Select
                          placeholder="Kg"
                          className="w-full"
                          styles={selectStyles2}
                          options={[
                            { value: "lbs", label: "Pounds (lbs)" },
                          ]}
                          value={productDetail?.unit}
                          onChange={(e) => {
                            setProductDetail({ ...productDetail, unit: e });
                          }}
                        />
                      </div>
                    </div>

                    {/* Supplier SKUs */}
                    <div className="space-y-2 mt-4">
                      <label className="text-labelColor font-medium font-satoshi">
                        Supplier SKUs
                      </label>

                      <div className="border border-borderColor rounded-md p-3 max-h-64 overflow-y-auto space-y-3">
                        {supplierList?.length ? (
                          supplierList.map((sup) => (
                            <div
                              key={sup.id}
                              className="grid gap-3 sm:grid-cols-2 items-center"
                            >
                              <input
                                type="text"
                                readOnly
                                value={sup.supplierName ?? ""}
                                className="border border-borderColor rounded-[4px] px-2.5 py-3 bg-gray-50 text-black"
                              />
                              <input
                                type="text"
                                placeholder={`Enter SKU for ${
                                  sup.supplierName ?? "supplier"
                                }`}
                                value={supplierSkus[sup.id] ?? ""}
                                onChange={(e) =>
                                  handleSupplierSkuChange(
                                    sup.id,
                                    e.target.value
                                  )
                                }
                                className="border border-borderColor rounded-[4px] px-2.5 py-3 text-black placeholder:text-secondary"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">
                            No suppliers found.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-theme text-white px-10  bg-theme"
                  >
                    {modal === "add"
                      ? "Add"
                      : modal === "edit"
                      ? "Update"
                      : modal === "delete"
                      ? "Delete"
                      : ""}{" "}
                    Stock
                  </button>
                </div>
              </div>
            </form>
          )}
        </Dialog>
      </div>
    </div>
  );
}
