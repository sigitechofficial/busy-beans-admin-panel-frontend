import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RiFileDownloadLine } from "react-icons/ri";
import { LuSearch } from "react-icons/lu";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { Checkbox } from "primereact/checkbox";

export default function MyDataTable(props) {
  const { selectedRows, setSelectedRows } = props;
  const [globalFilter, setGlobalFilter] = useState("");

  const onGlobalFilterChange = (event) => {
    setGlobalFilter(event?.target?.value);
  };

  const onSelectionChange = (e) => {
    setSelectedRows(e.value);
  };

  const filteredData = props?.data?.filter((item) =>
    Object.entries(item).some(([key, val]) =>
      key === "statusText"
        ? val.toLowerCase().includes(globalFilter.toLowerCase())
        : val &&
          val.toString().toLowerCase().includes(globalFilter.toLowerCase())
    )
  );

  const headerCheckbox = (
    <Checkbox
      checked={selectedRows?.length === filteredData?.length}
      onChange={(e) => {
        if (e.checked) {
          setSelectedRows(filteredData);
        } else {
          setSelectedRows([]);
        }
      }}
    />
  );

  const checkboxBody = (rowData) => {
    return (
      <Checkbox
        checked={selectedRows?.some((row) => row?.id === rowData?.id)}
        onChange={() => {
          let _selectedRows = [...selectedRows];
          const index = _selectedRows.findIndex(
            (row) => row?.id === rowData?.id
          );
          if (index === -1) {
            _selectedRows.push(rowData);
          } else {
            _selectedRows.splice(index, 1);
          }
          setSelectedRows(_selectedRows);
        }}
        className="custom-checkbox"
      />
    );
  };

  const rowClassName = (rowData) => {
    return selectedRows?.some((row) => row?.id === rowData?.id)
      ? "selected-row"
      : "";
  };

  return (
    <div className="bg-white p-5 sm:p-8 rounded-xl border border-borderColor shadow-tableShadow space-y-6">
      <div className="flex justify-between items-end md:items-center flex-wrap gap-3">
        <div className={`${props?.search ? "relative" : "hidden"}`}>
          <input
            type="search"
            value={globalFilter}
            onChange={onGlobalFilterChange}
            placeholder={props?.placeholder}
            className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
          />
          <LuSearch
            size={20}
            color="#111827"
            className="absolute top-3.5 left-3"
          />
        </div>

        <div className={`flex gap-x-5 ${props?.hide ? "hidden" : "block"}`}>
          <div className={`${props?.options ? "block" : "hidden"}`}>
            <Select
              options={props?.options}
              defaultValue={props?.selectedOption}
              onChange={(val) => {
                getSalonReport(salonID, val?.value);
                props?.setSelectedOption(val);
              }}
              styles={selectStyles}
            />
          </div>
          <button
            onClick={props?.handleDownload}
            className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white duration-200 group"
          >
            <RiFileDownloadLine size={24} />
            <span className="group-hover:text-black text-white font-inter">
              Download CSV
            </span>
          </button>
        </div>
      </div>

      <div className="manageTable">
        <DataTable
          value={filteredData}
          paginator={props.pagination}
          selectionMode="multiple" // Allow multiple row selection
          selection={selectedRows} // Bind the selected rows to the state
          onSelectionChange={props?.checkbox ? onSelectionChange : null} // Update selected rows when selection changes
          // scrollable 
          // scrollHeight="500px"
          rows={10}
          rowsPerPageOptions={[10, 25, 50, 100]}
          removableSort
          dataKey="id"
          emptyMessage="No Data Found"
          rowClassName={rowClassName} // Apply custom row class
          onRowClick={props.onRowClick}
        >
          {/* Header column with checkbox to select all rows */}
          {props?.checkbox && (
            <Column
              header={headerCheckbox}
              body={checkboxBody}
              style={{ width: "3rem", textAlign: "center" }}
            />
          )}

          {/* Other columns */}
          {props.columns?.map((col, ind) =>
            col?.filter ? (
              <Column
                key={ind}
                field={col.field}
                header={col.header}
                sortable={col?.sort}
                filter
                filterPlaceholder="Search"
                style={{ minWidth: col?.minWidth ? col?.minWidth : "12rem" }}
              />
            ) : (
              <Column
                key={ind}
                field={col.field}
                header={col.header}
                sortable={col?.sort}
                style={{ minWidth: col?.minWidth ? col?.minWidth : "12rem" }}
              />
            )
          )}
        </DataTable>
      </div>
    </div>
  );
}
