import React from 'react';
import styled from 'styled-components';

const StyledSelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #000000;
  border-radius: 0;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #000000;
`;

const CategorySelect = ({ value, onChange, categories }) => {
  return (
    <StyledSelect value={value} onChange={(e) => onChange(e.target.value)}>
      {categories.map((category, index) => (
        <option key={index} value={category}>{category}</option>
      ))}
    </StyledSelect>
  );
};

export default CategorySelect;
