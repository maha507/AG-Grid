import React, { StrictMode, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const CustomButtonComponent = (props) => {
  return <button onClick={() => window.alert("clicked")}>Push Me!</button>;
};

const rowSelection = {
  mode: "multiRow",
  headerCheckbox: true,
};

const App = () => {
  const [originalRowData, setOriginalRowData] = useState([]); // Original unfiltered data
  const [rowData, setRowData] = useState([]); // State for filtered API data
  const [columnDefs] = useState([
    { field: "Title", headerName: "Title", filter: "agTextColumnFilter" },
    { field: "Year", headerName: "Year", filter: "agNumberColumnFilter" },
    { field: "Type", headerName: "Type", filter: "agTextColumnFilter" },
    { field: "imdbID", headerName: "IMDB ID", filter: "agTextColumnFilter" },
    { field: "button", cellRenderer: CustomButtonComponent, flex: 1 },
  ]);
  const [searchText, setSearchText] = useState(""); // State for search text
  const gridRef = useRef(null); // Grid reference for API access

  const defaultColDef = {
    filter: true, // Enables filtering by default for all columns
    sortable: true, // Enables sorting for all columns
    resizable: true, // Allows column resizing
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      const apiKey = "60233b9b";
      const searchKeyword = "avengers"; // Example keyword
      const totalRecords = 50; // Number of records to fetch
      const resultsPerPage = 10; // OMDb API returns 10 results per page
      const pages = Math.ceil(totalRecords / resultsPerPage);

      let allResults = [];
      try {
        for (let page = 1; page <= pages; page++) {
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchKeyword}&page=${page}`
          );
          const data = await response.json();
          if (data.Search) {
            allResults = [...allResults, ...data.Search];
          } else {
            console.error("No results found:", data.Error);
            break;
          }
        }
        setOriginalRowData(allResults.slice(0, totalRecords)); // Save unfiltered data
        setRowData(allResults.slice(0, totalRecords)); // Set filtered data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle search by Title
  const handleSearch = () => {
    if (searchText.trim() === "") {
      // If search text is empty, reset to original data
      setRowData(originalRowData);
    } else {
      // Filter original data by Title field
      const filteredData = originalRowData.filter((row) =>
        row.Title.toLowerCase().includes(searchText.toLowerCase())
      );
      setRowData(filteredData);
    }
  };

  return (
    <div>
      {/* Custom Search Bar */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search by Title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: "5px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button onClick={handleSearch} style={{ padding: "5px 10px" }}>
          Search
        </button>
      </div>

      {/* AG Grid */}
      <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          ref={gridRef} // Pass the grid reference
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          rowSelection={rowSelection}
          onGridReady={(params) => {
            gridRef.current = params.api; // Set grid API to the ref
          }}
        />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
