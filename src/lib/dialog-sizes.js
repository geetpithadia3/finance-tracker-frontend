// Dialog size variants for consistent sizing across the application
export const dialogSizes = {
  // Small dialogs - confirmations, simple forms
  sm: "max-w-md",
  
  // Medium dialogs - detailed forms, most common use case  
  md: "max-w-lg",
  
  // Large dialogs - complex forms, transaction details
  lg: "max-w-2xl",
  
  // Extra large dialogs - imports, data tables
  xl: "max-w-4xl",
  
  // Full width dialogs - very wide content like import tables
  full: "max-w-6xl",
  
  // Height variants
  tall: "max-h-[85vh]",
  full_height: "h-[85vh]"
};

// Common dialog class combinations
export const dialogClasses = {
  // Basic dialog - most common
  basic: "max-w-lg",
  
  // Confirmation dialog
  confirmation: "max-w-md",
  
  // Form dialog
  form: "max-w-2xl",
  
  // Data table dialog
  table: "max-w-6xl max-h-[85vh]",
  
  // Settings/configuration dialog
  settings: "max-w-2xl max-h-[85vh] overflow-y-auto",
  
  // Import dialog with full height
  import: "max-w-6xl h-[85vh] sm:h-[800px]"
};