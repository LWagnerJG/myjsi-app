import { resolveOpportunityCustomerLink, getOpportunityCustomerDisplayName } from '../../../../utils/projectLinks.js';

export const isOpenProject = project => project.stage !== 'Won' && project.stage !== 'Lost';
export const projectListValue = project => {
  const raw = typeof project.value === 'string' ? project.value.replace(/[$,\s]/g, '') : project.value;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
};
export const matchesCompany = (project, company) => {
  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(company);
  if (!target) return true;
  return [project.company, project.endUser, ...(project.dealers || [])].some(value => {
    const token = normalize(value);
    return token && (token === target || (Math.min(token.length, target.length) >= 6 && (token.includes(target) || target.includes(token))));
  });
};

export const groupCustomerProjects = (customers = [], opportunities = []) => {
  const groups = new Map(customers.map(customer => [String(customer.id), { id: String(customer.id), name: customer.name, customer, projects: [] }]));
  opportunities.forEach(project => {
    const { customer } = resolveOpportunityCustomerLink(project, customers);
    const name = getOpportunityCustomerDisplayName(project, customer);
    const id = customer ? String(customer.id) : `unlinked:${String(name).trim().toLowerCase()}`;
    if (!groups.has(id)) groups.set(id, { id, name, customer: null, projects: [] });
    groups.get(id).projects.push(project);
  });
  return [...groups.values()].sort((a, b) => {
    const activeDifference = b.projects.filter(isOpenProject).length - a.projects.filter(isOpenProject).length;
    return activeDifference || a.name.localeCompare(b.name);
  });
};

const searchArray = value => Array.isArray(value) ? value : value ? [value] : [];
const searchEntity = value => typeof value === 'object' && value ? [value.name, value.firstName, value.lastName, value.email, value.role, value.title].filter(Boolean).join(' ') : String(value || '');
const includesQuery = (fields, query) => {
  const text = fields.map(searchEntity).join(' ').toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(word => text.includes(word));
};
const customerSearchFields = group => [group.name, group.customer?.domain, ...searchArray(group.customer?.contacts), ...searchArray(group.customer?.contact), ...searchArray(group.customer?.dealers), ...searchArray(group.customer?.dealer)];
export const matchesCustomerQuery = (group, query) => includesQuery(customerSearchFields(group), query);
export const matchesWorkspaceQuery = (project, group, query) => includesQuery([...customerSearchFields(group), project.name, project.company, project.endUser, ...searchArray(project.contact), ...searchArray(project.contacts), ...searchArray(project.dealers), ...searchArray(project.dealer)], query);
