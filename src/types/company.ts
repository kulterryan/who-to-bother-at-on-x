import type { Category } from './contacts';

export interface Company {
  id: string;
  name: string;
  description: string;
  logoType: string;
  categories: Category[];
}

export interface CompanyListItem {
  id: string;
  name: string;
  description: string;
}
