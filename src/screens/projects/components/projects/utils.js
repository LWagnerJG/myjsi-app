export const PROJECTS_TAB_OPTIONS = [
  { value: 'pipeline', label: 'Active Projects' },
  { value: 'my-projects', label: 'Installations' }
];

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

export const fmtCurrency = (v) => typeof v === 'string' ? (v.startsWith('$')? v : '$'+v) : (v ?? 0).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
