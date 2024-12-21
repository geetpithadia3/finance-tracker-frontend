import styled from 'styled-components';
import DatePicker from 'react-datepicker';

export const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 8px;
  border: none; /* Remove border */
  border-radius: 4px;
  box-sizing: border-box;
  z-index: 1000; /* Ensure it appears above other elements */
`;