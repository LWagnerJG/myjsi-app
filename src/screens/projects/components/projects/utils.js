import { formatCurrency, parseCurrencyAmount } from '../../../../utils/format.js';

export const PROJECTS_TAB_OPTIONS = [
  { value: 'pipeline', label: 'Active Projects' },
  { value: 'customers', label: 'Customers' },
  { value: 'my-projects', label: 'Installations' },
];

/** Mock dealer contact directory for project stakeholder pickers. */
export const DEALER_CONTACTS = {
  'Business Furniture': [
    { name: 'Mike Johnson', title: 'Account Manager' },
    { name: 'Sarah Palmer', title: 'Design Consultant' },
    { name: 'Tom Bradley', title: 'Regional Director' },
  ],
  'COE': [
    { name: 'Emily Raine', title: 'Project Manager' },
    { name: 'David Chen', title: 'Sales Representative' },
    { name: 'Lisa Park', title: 'Account Executive' },
    { name: 'Tom Hardy', title: 'Operations Manager' },
  ],
  'OfficeWorks': [
    { name: 'Alan Cooper', title: 'Senior Designer' },
    { name: 'Rachel Green', title: 'Account Manager' },
    { name: 'Mark Wilson', title: 'Sales Lead' },
  ],
  'RJE': [
    { name: 'Sara Lin', title: 'Regional Manager' },
    { name: 'Priya Patel', title: 'Design Specialist' },
    { name: 'James Foster', title: 'Account Executive' },
  ],
};

/**
 * Format project pipeline totals. Accepts numeric values or pre-formatted "$…" strings.
 */
export const fmtCurrency = (v) => {
  if (typeof v === 'string') {
    if (v.startsWith('$')) return v;
    return formatCurrency(parseCurrencyAmount(v));
  }
  return formatCurrency(v ?? 0);
};
