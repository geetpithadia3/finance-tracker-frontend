import React from 'react';
import { StyledInput } from '../styles/CommonStyles';




const EditableCell = ({ type, value, onChange }) => {
  return (
    <StyledInput
      type={type || 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default EditableCell;
