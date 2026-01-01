import { useState, useEffect, useRef } from "react";
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
  serverPagination, // { page, limit, totalRecords, totalPages, onPageChange, onLimitChange }
  onSearchChange, // Callback function to handle search changes for server-side search
  searchValue, // Controlled search value from parent (for server-side search)
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

  const [globalFilter, setGlobalFilter] = useState(searchValue || "");
  const tableRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Sync local state with prop when using server-side search (only when prop changes from outside)
  useEffect(() => {
    if (onSearchChange && searchValue !== undefined) {
      setGlobalFilter(prev => {
        // Only update if the prop value is different to avoid unnecessary updates
        return prev !== searchValue ? searchValue : prev;
      });
    }
  }, [searchValue, onSearchChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const onGlobalFilterChange = (event) => {
    const value = event?.target?.value ?? "";
    // Update local state immediately for responsive typing
    setGlobalFilter(value);
    
    // If onSearchChange callback is provided (server-side search), call it with debounce
    if (onSearchChange) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for debouncing (800ms delay - optimized balance)
      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 800);
    }
  };

  const onSelectionChange = (e) => {
    updateSelected(e.value || []);
  };

  // For server-side search, don't filter on client side - use data as is
  // For client-side search, filter the data
  const filteredData = onSearchChange 
    ? data // Server-side search: use data as-is, filtering happens on server
    : data.filter((item) =>
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

  // Server-side pagination handler
  const handlePageChange = (e) => {
    if (serverPagination) {
      // PrimeReact uses 0-based page index, API uses 1-based
      const newPage = e.page + 1;
      const newLimit = e.rows;

      // If limit changed, reset to page 1 and update limit
      if (newLimit !== serverPagination.limit) {
        serverPagination.onLimitChange?.(newLimit);
      } else if (newPage !== serverPagination.page) {
        // Only change page if limit didn't change
        serverPagination.onPageChange?.(newPage);
      }
    }
  };

  // Calculate pagination info for bottom display (left-aligned)
  const getPaginationInfo = () => {
    if (!serverPagination) return null;
    
    const { page, limit, totalRecords } = serverPagination;
    const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
    const endRecord = Math.min(page * limit, totalRecords || 0);
    
    if (totalRecords) {
      return `Results ${startRecord}-${endRecord} total ${totalRecords}`;
    }
    return null;
  };

  // Setup paginator flex layout when server pagination is active
  useEffect(() => {
    if (serverPagination && tableRef.current) {
      // Use setTimeout to ensure DOM is ready after PrimeReact renders
      const timeoutId = setTimeout(() => {
        const paginator = tableRef.current?.querySelector('.p-paginator');
        if (paginator) {
          const paginationInfo = getPaginationInfo();
          if (paginationInfo) {
            // Make paginator a flex container with relative positioning
            paginator.style.display = 'flex';
            paginator.style.alignItems = 'center';
            paginator.style.position = 'relative';
            paginator.style.minHeight = '3rem'; // Ensure space for absolute positioning
            
            // Create or update results info element (left side)
            let resultsInfo = paginator.querySelector('.pagination-results-text');
            if (!resultsInfo) {
              resultsInfo = document.createElement('div');
              resultsInfo.className = 'pagination-results-text text-sm text-gray-600 font-medium';
              paginator.insertBefore(resultsInfo, paginator.firstChild);
            }
            resultsInfo.textContent = paginationInfo;
            resultsInfo.style.flexShrink = '0';
            
            // Find the rows per page dropdown (it's usually the last element or has specific classes)
            const allChildren = Array.from(paginator.childNodes).filter(
              child => child.nodeType === 1 && child !== resultsInfo && 
              !child.classList.contains('p-paginator-controls-wrapper') &&
              !child.classList.contains('p-paginator-dropdown-wrapper') &&
              !child.classList.contains('pagination-results-text')
            );
            
            // Find dropdown - usually has classes like p-paginator-rpp-options or contains a select/dropdown
            const dropdownElement = allChildren.find(child => {
              return child.classList.contains('p-paginator-rpp-options') ||
                     child.querySelector('.p-paginator-rpp-options') ||
                     child.querySelector('select') ||
                     child.querySelector('.p-dropdown') ||
                     (child.textContent && child.textContent.includes('100')); // Fallback: find element with "100" (rows per page value)
            });
            
            const controlsElements = allChildren.filter(child => child !== dropdownElement);
            
            // Create controls wrapper (centered)
            let controlsWrapper = paginator.querySelector('.p-paginator-controls-wrapper');
            if (!controlsWrapper && controlsElements.length > 0) {
              controlsWrapper = document.createElement('div');
              controlsWrapper.className = 'p-paginator-controls-wrapper';
              controlsWrapper.style.display = 'flex';
              controlsWrapper.style.alignItems = 'center';
              controlsWrapper.style.gap = '0.5rem';
              controlsWrapper.style.position = 'absolute';
              controlsWrapper.style.left = '50%';
              controlsWrapper.style.transform = 'translateX(-50%)';
              controlsElements.forEach(child => {
                if (child.parentNode === paginator) {
                  controlsWrapper.appendChild(child);
                }
              });
              paginator.appendChild(controlsWrapper);
            }
            
            // Create dropdown wrapper (right side)
            let dropdownWrapper = paginator.querySelector('.p-paginator-dropdown-wrapper');
            if (!dropdownWrapper && dropdownElement) {
              dropdownWrapper = document.createElement('div');
              dropdownWrapper.className = 'p-paginator-dropdown-wrapper';
              dropdownWrapper.style.flexShrink = '0';
              dropdownWrapper.style.marginLeft = 'auto';
              if (dropdownElement.parentNode === paginator) {
                dropdownWrapper.appendChild(dropdownElement);
              }
              paginator.appendChild(dropdownWrapper);
            }
          }
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [serverPagination?.page, serverPagination?.limit, serverPagination?.totalRecords]);

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
      <div className="manageTable" ref={tableRef}>
        <DataTable
          value={filteredData}
          paginator={pagination || !!serverPagination}
          lazy={!!serverPagination}
          selectionMode="multiple"
          selection={selected}
          onSelectionChange={checkbox ? onSelectionChange : null}
          removableSort
          dataKey={dataKey}
          emptyMessage="No Data Found"
          onRowClick={onRowClick}
          sortField={sortField}
          sortOrder={sortOrder}
          {...(serverPagination ? {
            first: (serverPagination.page - 1) * serverPagination.limit,
            rows: serverPagination.limit,
            totalRecords: serverPagination.totalRecords,
            rowsPerPageOptions: [10, 25, 50, 100],
            onPage: handlePageChange,
            paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          } : {
            rows: 100,
            rowsPerPageOptions: [10, 25, 50, 100, 150, 250, 500, 1000]
          })}
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
