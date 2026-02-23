import {
  Monitor, Users, Shield, Wrench, Briefcase, Star, PenTool, Building2, Sparkles
} from 'lucide-react';

// role = the user-role that can see this community in production (all visible in demo)
export const SUBREDDITS = [
  { id: 'dealer-designers',  name: 'Dealer Designers',   icon: PenTool,   color: '#6A6762', members: 203, role: 'Dealer Designers',  description: 'Spec workflows, material selections, CET tips, and creative problem-solving for in-house dealership designers.' },
  { id: 'dealer-principals', name: 'Dealer Principals',  icon: Building2, color: '#4A7C59', members: 58,  role: 'Dealer Principals', description: 'Business strategy, partnership growth, and the decisions that drive dealership performance.' },
  { id: 'dealer-sales',      name: 'Dealer Sales Reps',  icon: Star,      color: '#C4956A', members: 176, role: 'Dealer Sales Reps', description: 'Sales tactics, objection handling, quick wins, and what is working on the floor right now.' },
  { id: 'rep-principals',    name: 'Rep Principals',     icon: Briefcase, color: '#5B7B8C', members: 31,  role: 'Rep Principals',    description: 'Dealer development, territory strategy, and running a rep firm at the highest level.' },
  { id: 'reps',              name: 'Reps',               icon: Users,     color: '#8C7B63', members: 89,  role: 'All Reps',          description: 'The general rep community \u2014 vertical markets, new opportunities, showrooms, and field intelligence.' },
  { id: 'new-reps',          name: 'New Reps!',          icon: Sparkles,  color: '#9B8574', members: 24,  role: 'New Reps',          description: "First year? You're not alone. Questions welcome, experience encouraged. Learn fast, grow faster." },
  { id: 'jsiers',            name: "JSI'ers",            icon: Shield,    color: '#4A6258', members: 47,  role: 'JSI Team',          description: 'For JSI employees \u2014 internal updates, events, and cross-team conversations.' },
  { id: 'cet-designers',     name: 'CET Designers',      icon: Monitor,   color: '#6B7B6A', members: 112, role: 'CET Users',         description: 'Configurra/CET symbol sharing, workarounds, rendering tips, and JSI-specific configuration advice.' },
  { id: 'install-tips',      name: 'Install Tips',       icon: Wrench,    color: '#7A6E5D', members: 67,  role: 'Install Crews',     description: 'Field installation knowledge \u2014 sequencing, damage prevention, IT coordination, and hard-won lessons.' },
];
