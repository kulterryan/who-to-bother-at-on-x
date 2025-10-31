import type { Category } from './contacts';

export interface Company {
  $schema?: string;
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
