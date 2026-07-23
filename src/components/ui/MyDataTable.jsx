import { useState, useEffect, useRef, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RiFileDownloadLine } from "react-icons/ri";
import { LuSearch } from "react-icons/lu";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";

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
  isRowCheckboxDisabled,
  sortField: sortFieldProp,
  sortOrder: sortOrderProp,
  onSort: onSortProp,
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
  const headerCheckboxRef = useRef(null);
  const selectedRef = useRef(selected);

  // Keep ref in sync so checkbox handler always has latest selection (avoids stale closure + race with row click)
  selectedRef.current = selected;

  // Client-side sort: use internal state when parent doesn't pass onSort
  const [internalSort, setInternalSort] = useState({ sortField: null, sortOrder: 1 });
  const sortField = onSortProp ? sortFieldProp : internalSort.sortField;
  const sortOrder = onSortProp ? sortOrderProp : internalSort.sortOrder;
  const onSort = onSortProp || ((e) => setInternalSort({ sortField: e.sortField, sortOrder: e.sortOrder }));

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
    const next = e.value || [];
    selectedRef.current = next;
    updateSelected(next);
  };

  // When checkbox column is used, only checkboxes control selection; row click must not overwrite
  const handleSelectionChange = checkbox ? () => {} : onSelectionChange;

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

  // Client-side sort: sort current table data by sortField/sortOrder (no backend call)
  const sortedData = useMemo(() => {
    if (!sortField || !filteredData?.length) return filteredData;
    const order = sortOrder === -1 ? -1 : 1;
    return [...filteredData].sort((a, b) => {
      let va = a?.[sortField];
      let vb = b?.[sortField];
      // Strip $ and % for numbers (e.g. "$123.45" or "10%")
      if (typeof va === "string" && /^[\d.,]+%?$/.test(va.replace(/[$,\s]/g, ""))) {
        va = parseFloat(String(va).replace(/[$%,\s]/g, "")) || 0;
      }
      if (typeof vb === "string" && /^[\d.,]+%?$/.test(vb.replace(/[$,\s]/g, ""))) {
        vb = parseFloat(String(vb).replace(/[$%,\s]/g, "")) || 0;
      }
      if (va == null && vb == null) return 0;
      if (va == null) return order;
      if (vb == null) return -order;
      if (typeof va === "number" && typeof vb === "number") return order * (va - vb);
      return order * String(va).localeCompare(String(vb), undefined, { numeric: true });
    });
  }, [filteredData, sortField, sortOrder]);

  // Normalize ids to string so number vs string (e.g. 123 vs "123") match
  const toId = (val) => (val == null ? "" : String(val));
  const isCheckboxDisabled = (row) =>
    typeof isRowCheckboxDisabled === "function" && isRowCheckboxDisabled(row);

  const selectableRows = useMemo(
    () =>
      isRowCheckboxDisabled
        ? sortedData.filter((item) => !isCheckboxDisabled(item))
        : sortedData,
    [sortedData, isRowCheckboxDisabled]
  );

  const selectedIds = useMemo(
    () => new Set((selected ?? []).map((s) => toId(s?.[dataKey])).filter(Boolean)),
    [selected, dataKey]
  );
  const isAllSelected =
    selectableRows.length > 0 &&
    selectableRows.every((item) => selectedIds.has(toId(item?.[dataKey])));
  const isSomeSelected = selectableRows.some((item) =>
    selectedIds.has(toId(item?.[dataKey]))
  );

  // Include selection flag in row data so PrimeReact re-renders checkbox cells
  const tableRows = useMemo(() => {
    if (!checkbox) return sortedData;
    return sortedData.map((row) => ({
      ...row,
      __isSelected: selectedIds.has(toId(row?.[dataKey])),
    }));
  }, [checkbox, sortedData, selectedIds, dataKey]);

  // Native checkbox: visible checked state, no PrimeReact dependency
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = !isAllSelected && isSomeSelected;
    }
  }, [isAllSelected, isSomeSelected]);

  // Drop rows that became non-selectable from the current selection
  useEffect(() => {
    if (!checkbox || !isRowCheckboxDisabled || !selected?.length) return;
    const next = selected.filter((row) => !isCheckboxDisabled(row));
    if (next.length !== selected.length) {
      selectedRef.current = next;
      updateSelected(next);
    }
  }, [checkbox, isRowCheckboxDisabled, selected, sortedData]);

  const checkIcon = (
    <svg className="check-icon w-3.5 h-3.5 text-white shrink-0 transition-opacity duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
  const minusIcon = (
    <svg className="minus-icon w-3 h-3 text-white shrink-0 opacity-0 absolute transition-opacity duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 12h14" />
    </svg>
  );

  const headerCheckbox = (
    <div className="relative inline-flex items-center justify-center">
      <input
        ref={headerCheckboxRef}
        type="checkbox"
        checked={!!isAllSelected}
        onChange={(e) => {
          e.stopPropagation();
          e.nativeEvent?.stopImmediatePropagation?.();
          if (e.target.checked) {
            const next = [...selectableRows];
            selectedRef.current = next;
            updateSelected(next);
          } else {
            selectedRef.current = [];
            updateSelected([]);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent?.stopImmediatePropagation?.();
        }}
        className="peer absolute inset-0 w-5 h-5 cursor-pointer opacity-0 z-[1]"
        aria-label="Select all rows"
      />
      <span
        className="pointer-events-none w-5 h-5 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center
          transition-colors duration-150 ease-out
          peer-hover:border-gray-400 peer-focus:ring-2 peer-focus:ring-gray-400/40 peer-focus:ring-offset-1
          peer-checked:bg-gray-800 peer-checked:border-gray-800 peer-checked:[&>.check-icon]:opacity-100
          peer-indeterminate:bg-gray-600 peer-indeterminate:border-gray-600 peer-indeterminate:[&>.minus-icon]:opacity-100"
        aria-hidden
      >
        <svg className="check-icon w-3.5 h-3.5 text-white shrink-0 opacity-0 transition-opacity duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
        {minusIcon}
      </span>
    </div>
  );

  const checkboxBody = (rowDataOrOptions) => {
    // PrimeReact passes (rowData, options); normalize to row object
    const rowData = rowDataOrOptions?.data ?? rowDataOrOptions;
    const rowIdRaw = rowData?.[dataKey];
    const rowIdStr = toId(rowIdRaw);
    const disabled = isCheckboxDisabled(rowData);
    const isChecked =
      !disabled &&
      (rowData?.__isSelected === true || selectedIds.has(rowIdStr));
    const handleChange = (e) => {
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
      if (disabled) return;
      const current = selectedRef.current ?? [];
      const copy = [...current];
      const idx = copy.findIndex((row) => toId(row?.[dataKey]) === rowIdStr);
      if (idx === -1) {
        const toAdd =
          sortedData.find((r) => toId(r?.[dataKey]) === rowIdStr) ?? rowData;
        const { __isSelected, ...cleanRow } = toAdd || {};
        copy.push(cleanRow);
      } else {
        copy.splice(idx, 1);
      }
      selectedRef.current = copy;
      updateSelected(copy);
    };
    const handleClick = (e) => {
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
    };
    return (
      <div
        key={`row-cb-${rowIdStr}-${isChecked ? "1" : "0"}`}
        onClick={disabled ? undefined : handleClick}
        className={`relative inline-flex items-center justify-center ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <input
          type="checkbox"
          disabled={disabled}
          checked={!!isChecked}
          onChange={handleChange}
          onClick={handleClick}
          className={`absolute inset-0 w-5 h-5 opacity-0 z-[1] ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          aria-label={
            disabled
              ? `Row ${rowIdStr || ""} cannot be selected`
              : `Select row ${rowIdStr || ""}`
          }
        />
        <span
          className={`pointer-events-none w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-150 ease-out ${
            isChecked
              ? "bg-gray-800 border-gray-800"
              : "bg-white border-gray-300"
          }`}
          aria-hidden
        >
          <svg
            className={`w-3.5 h-3.5 text-white shrink-0 transition-opacity duration-150 ${
              isChecked ? "opacity-100" : "opacity-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>
    );
  };

  // ===== CSV Download (built-in) =====
  const handleDownloadCsv = () => {
    const rowsToExport =
      selected && selected.length > 0 ? selected : sortedData;

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
          value={tableRows}
          paginator={pagination || !!serverPagination}
          lazy={!!serverPagination}
          {...(checkbox
            ? {
                selectionMode: "multiple",
                selection: selected,
                onSelectionChange: handleSelectionChange,
              }
            : {})}
          removableSort
          dataKey={dataKey}
          emptyMessage="No Data Found"
          onRowClick={onRowClick}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={onSort}
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
              checkbox &&
              selected?.some(
                (row) => toId(row?.[dataKey]) === toId(rowData?.[dataKey]),
              )
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
