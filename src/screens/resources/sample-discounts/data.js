// Sample Policies — SSA reference data
// Effective May 1, 2021

export const SAMPLE_POLICY_META = {
  programLabel: 'JSI sample program',
  effectiveDate: 'Effective May 1, 2021',
  intro:
    'A quick reference for selecting the right sample path, applying the correct discount, and keeping the SSA attached from quote through order entry.',
  commissionNote: 'Sample policy orders are non-commissionable.',
};

export const SAMPLE_POLICIES = [
  {
    id: 'dealer-project',
    title: 'Dealer Project Samples',
    description:
      'For active dealer-led opportunities where one JSI sample can help a client confirm fit, finish, and intent.',
    ssa: 'DR-228919',
    discount: 75,
    notes: [
      'One piece per model number',
      'Use for project-specific sample requests',
    ],
  },
  {
    id: 'rep-showroom',
    title: 'Rep Showroom & Rep Samples',
    description:
      'The best sample allowance for rep showrooms and selling tools that represent JSI in the field.',
    ssa: 'RT-711576',
    discount: 85,
    notes: [
      'One piece per model number',
      'Reserve for rep showroom or selling sample needs',
    ],
  },
  {
    id: 'dealer-showroom',
    title: 'Dealer Showroom Samples',
    description:
      'For dealer showroom floors and vignettes that keep JSI visible, current, and easy to specify.',
    ssa: 'DR-996860',
    discount: 75,
    notes: [
      'Processed as a standard order',
      'Use when building a dealer JSI display',
    ],
  },
  {
    id: 'personal-use',
    title: 'Personal Use',
    subtitle: 'Reps, Dealers, Designers & Internal Employees',
    description:
      'A courtesy sample path for the JSI community when product is purchased for personal spaces.',
    ssa: 'DF-022745',
    discount: 75,
    notes: [
      'Confirm eligibility before submitting',
    ],
  },
  {
    id: 'design-firms',
    title: 'Design Firms',
    description:
      'For design partners who need a trusted JSI sample to support specification work and client presentations.',
    ssa: 'WE-304039',
    discount: 75,
    notes: [
      'Use for design-firm evaluation samples',
    ],
  },
];

