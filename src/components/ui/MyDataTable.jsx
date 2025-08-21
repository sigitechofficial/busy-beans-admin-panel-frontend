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

  const data = Array.isArray(props?.data) ? props.data : [];
  const columns = Array.isArray(props?.columns) ? props.columns : [];

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

  const headerCheckbox = (
    <Checkbox
      checked={selected?.length > 0 && selected?.length === filteredData?.length}
      indeterminate={
        selected?.length > 0 && selected?.length !== filteredData?.length
      }
      onChange={(e) => {
        if (e.checked) {
          updateSelected(filteredData);
        } else {
          updateSelected([]);
        }
      }}
    />
  );

  const checkboxBody = (rowData) => {
    const isChecked = selected?.some((row) => row?.id === rowData?.id);
    return (
      <Checkbox
        checked={!!isChecked}
        onChange={() => {
          const copy = [...(selected || [])];
          const idx = copy.findIndex((row) => row?.id === rowData?.id);
          if (idx === -1) copy.push(rowData);
          else copy.splice(idx, 1);
          updateSelected(copy);
        }}
        className="custom-checkbox"
      />
    );
  };

  const rowClassName = (rowData) =>
    selected?.some((row) => row?.id === rowData?.id) ? "selected-row" : "";

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
    a.download = props?.csvFileName || "export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={
        props?.Styles ??
        `bg-white p-5 sm:p-8 rounded-xl border border-borderColor shadow-tableShadow space-y-6`
      }
    >
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
                props?.onOptionChange?.(val); 
                props?.setSelectedOption?.(val);
              }}
              styles={selectStyles}
            />
          </div>
          <button
            onClick={props?.handleDownload ?? handleDownloadCsv}
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
          selection={selected}
          onSelectionChange={props?.checkbox ? onSelectionChange : null}
          // scrollable
          // scrollHeight="500px"
          rows={10}
          rowsPerPageOptions={[10, 25, 50, 100]}
          removableSort
          dataKey="id"
          emptyMessage="No Data Found"
          rowClassName={rowClassName}
          onRowClick={props.onRowClick}
          sortField={props.sortField}
          sortOrder={props.sortOrder}
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
          {columns?.map((col, ind) =>
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
