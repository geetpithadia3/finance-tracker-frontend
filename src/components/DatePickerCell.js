import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 8px;
  border: 1px solid #000000;
  border-radius: 0;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #000000;
  font-size: 14px;
`;

const DatePickerCell = ({ value: initialValue, onChange }) => {
  const [selectedDate, setSelectedDate] = useState(initialValue ? new Date(initialValue) : new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onChange(date);
  };

  return (
    <StyledDatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      dateFormat="yyyy-MM-dd"
    />
  );
};

export default DatePickerCell;
