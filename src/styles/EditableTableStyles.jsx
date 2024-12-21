import styled from 'styled-components';

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  max-height: 900px; /* Adjust as needed */
  position: relative; /* Ensure it appears above other elements */
  z-index: 1;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: none;
    padding: 12px;
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    color: #495057;
    position: sticky;
    top: 0;
    z-index: 2; /* Ensure it appears above other elements */
  }

  td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tr:hover {
    background-color: #e9ecef;
  }
`;