import styled from 'styled-components';

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  max-height: 400px; /* Adjust as needed */
  position: relative;
  z-index: 1; /* Ensure it appears above other elements */
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    color: #495057;
    position: sticky;
    top: 0;
    z-index: 2; /* Ensure it appears above other elements */
  }

  tfoot tr {
    background-color: #f8f9fa;
    color: #495057;
    position: sticky;
    bottom: 0;
    z-index: 1; /* Ensure it appears above other elements */
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #ddd;
  }
`;