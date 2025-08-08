// Replacements related data
export const REPLACEMENT_REQUESTS_DATA = [
    { id: 'req1', product: 'Vision Conference Table', reason: 'Damaged in shipping', status: 'Approved', date: '2023-05-20' },
    { id: 'req2', product: 'Arwyn Swivel Chair', reason: 'Missing parts', status: 'Pending', date: '2023-05-22' },
    { id: 'req3', product: 'Moto Casegood', reason: 'Wrong finish', status: 'Rejected', date: '2023-05-18' },
].sort((a, b) => new Date(b.date) - new Date(a.date));