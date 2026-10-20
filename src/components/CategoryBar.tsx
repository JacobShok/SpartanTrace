import React from 'react';
import {
  Laptop,
  KeyRound,
  CreditCard,
  Shirt,
  Sparkles,
  BookOpen,
  Briefcase,
  Grid,
  Layers,
} from 'lucide-react';
import { ITEM_CATEGORIES } from '../utils/constants';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Grid className="w-4 h-4" />,
  Electronics: <Laptop className="w-4 h-4" />,
  Keys: <KeyRound className="w-4 h-4" />,
  'IDs & Cards': <CreditCard className="w-4 h-4" />,
  'Clothing & Apparel': <Shirt className="w-4 h-4" />,
  Accessories: <Sparkles className="w-4 h-4" />,
  'Books & Supplies': <BookOpen className="w-4 h-4" />,
  'Bags & Backpacks': <Briefcase className="w-4 h-4" />,
  Other: <Layers className="w-4 h-4" />,
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = ['All', ...ITEM_CATEGORIES];

  return (
    <div className="bg-white border-b border-gray-100 shadow-2xs py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80 hover:text-gray-900'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-gray-500'}>
                  {CATEGORY_ICONS[cat] || <Layers className="w-4 h-4" />}
                </span>
                <span>{cat === 'All' ? 'All Items' : cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
