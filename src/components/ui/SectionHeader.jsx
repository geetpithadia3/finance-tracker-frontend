import React from 'react';

/**
 * SectionHeader - Consistent top bar for major app sections
 * @param {string} title - Main section title
 * @param {string} [subtitle] - Optional subtitle/description
 * @param {React.ReactNode} [children] - Right-side content (e.g., MonthSelector, actions)
 */
const SectionHeader = ({ title, subtitle, children }) => (
  <div className="bg-card rounded-lg border shadow-md p-6 mb-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  </div>
);

export default SectionHeader; 