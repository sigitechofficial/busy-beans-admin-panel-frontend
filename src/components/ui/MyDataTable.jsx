import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RiFileDownloadLine } from "react-icons/ri";
import { LuSearch } from "react-icons/lu";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { Checkbox } from "primereact/checkbox";

export default function MyDataTable({
  selectedRows,
  setSelectedRows,
  data = [],
  columns = [],
  search,
  pagination,
  checkbox,
  sortField,
  sortOrder,
  onRowClick,
  placeholder,
  hide,
  options,
  selectedOption,
  onOptionChange,
  setSelectedOption,
  handleDownload,
  csvFileName,
  Styles,
  rowTestId,
  dataKey = "id",
  ...rest
}) {
  const [internalSelectedRows, setInternalSelectedRows] = useState([]);
  const selected = selectedRows ?? internalSelectedRows;
  const updateSelected = setSelectedRows ?? setInternalSelectedRows;

  const [globalFilter, setGlobalFilter] = useState("");

  const onGlobalFilterChange = (event) => {
    setGlobalFilter(event?.target?.value ?? "");
  };

  const onSelectionChange = (e) => {
    updateSelected(e.value || []);
  };

  const filteredData = data.filter((item) =>
    Object.entries(item).some(([key, val]) =>
      key === "statusText"
        ? String(val ?? "")
          .toLowerCase()
          .includes(globalFilter.toLowerCase())
        : val &&
        String(val).toLowerCase().includes(globalFilter.toLowerCase())
    )
  );

  const selectedIds = new Set(selected?.map((s) => s?.[dataKey]));
  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((item) => selectedIds.has(item?.[dataKey]));
  const isSomeSelected =
    filteredData.some((item) => selectedIds.has(item?.[dataKey]));

  const headerCheckbox = (
    <Checkbox
      checked={isAllSelected}
      indeterminate={!isAllSelected && isSomeSelected}
      onChange={(e) => {
        if (e.checked) {
          updateSelected(filteredData);
        } else {
          updateSelected([]);
        }
      }}
      className="accent-black cursor-pointer"
    /> 
  );

  const checkboxBody = (rowData) => {
    const isChecked = selected?.some((row) => row?.[dataKey] === rowData?.[dataKey]);
    return (
      <Checkbox
        checked={!!isChecked}
        onChange={() => {
          const copy = [...(selected || [])];
          const idx = copy.findIndex((row) => row?.[dataKey] === rowData?.[dataKey]);
          if (idx === -1) copy.push(rowData);
          else copy.splice(idx, 1);
          updateSelected(copy);
        }}
        className="custom-checkbox [&_.p-checkbox-box.p-highlight]:!bg-black [&_.p-checkbox-box.p-highlight]:!border-black cursor-pointer"
      />
    );
  };

  // ===== CSV Download (built-in) =====
  const handleDownloadCsv = () => {
    const rowsToExport =
      selected && selected.length > 0 ? selected : filteredData;

    if (!rowsToExport?.length || !columns?.length) return;

    const headers = columns.map((c) => c.header ?? c.field ?? "").join(",");

    const escapeCsv = (v) => {
      const s = v == null ? "" : String(v);
      const needsQuotes = /[",\n]/.test(s);
      const safe = s.replace(/"/g, '""');
      return needsQuotes ? `"${safe}"` : safe;
    };

    const body = rowsToExport
      .map((row) =>
        columns
          .map((c) => escapeCsv(row?.[c.field]))
          .join(",")
      )
      .join("\n");

    const csv = [headers, body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFileName || "export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={
        Styles ??
        "bg-white p-5 sm:p-8 rounded-xl border border-borderColor shadow-tableShadow space-y-6"
      }
      {...rest}
    >
      {/* header with search + options + download */}
      <div className="flex justify-between items-end md:items-center flex-wrap gap-3">
        <div className={`${search ? "relative" : "hidden"}`}>
          <input
            type="search"
            value={globalFilter}
            onChange={onGlobalFilterChange}
            placeholder={placeholder}
            className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-themeGray rounded-lg ps-10 pe-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200"
            data-testid="search-input"
          />
          <LuSearch
            size={20}
            color="#111827"
            className="absolute top-3.5 left-3"
          />
        </div>

        <div className={`flex gap-x-5 ${hide ? "hidden" : "block"}`}>
          <div className={`${options ? "block" : "hidden"}`}>
            <Select
              options={options}
              defaultValue={selectedOption}
              onChange={(val) => {
                onOptionChange?.(val);
                setSelectedOption?.(val);
              }}
              styles={selectStyles}
            />
          </div>
          <button
            onClick={handleDownload ?? handleDownloadCsv}
            className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white duration-200 group"
            data-testid="download-csv"
          >
            <RiFileDownloadLine size={24} />
            <span className="group-hover:text-black text-white font-inter">
              Download CSV
            </span>
          </button>
        </div>
      </div>

      {/* PrimeReact DataTable */}
      <div className="manageTable">
        <DataTable
          value={filteredData}
          paginator={pagination}
          selectionMode="multiple"
          selection={selected}
          onSelectionChange={checkbox ? onSelectionChange : null}
          // scrollable
          // scrollHeight="500px"
          rows={10}
          rowsPerPageOptions={[10, 25, 50, 100]}
          removableSort
          dataKey={dataKey}
          emptyMessage="No Data Found"
          onRowClick={onRowClick}
          sortField={sortField}
          sortOrder={sortOrder}
          rowClassName={(rowData) => {
            const base =
              selected?.some((row) => row?.[dataKey] === rowData?.[dataKey])
                ? "selected-row"
                : "";
            return `${base} ${rowTestId ? rowTestId(rowData) : ""}`;
          }}
        >
          {checkbox && (
            <Column
              header={headerCheckbox}
              body={checkboxBody}
              style={{ width: "3rem", textAlign: "center" }}
            />
          )}

          {/* Other columns */}
          {columns?.map((col, ind) => (
            <Column
              key={ind}
              field={col.field}
              header={col.header}
              sortable={col?.sort}
              filter={!!col?.filter}
              filterPlaceholder={col?.filter ? "Search" : undefined}
              style={{ minWidth: col?.minWidth ? col?.minWidth : "12rem" }}
            />
          ))}
        </DataTable>
      </div>
    </div>
  );
}
