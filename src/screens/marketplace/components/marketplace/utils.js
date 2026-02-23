import { Award, Star, Trophy, Target, UserPlus, ShoppingBag, CheckCircle, Gift } from 'lucide-react';

export const TXN_ICONS = { 
  award: Award, 
  star: Star, 
  trophy: Trophy, 
  target: Target, 
  'user-plus': UserPlus, 
  'shopping-bag': ShoppingBag, 
  'check-circle': CheckCircle 
};

export const getIcon = (key) => TXN_ICONS[key] || Gift;
