export interface Contact {
  product: string;
  handles: string[];
  email?: string;
}

export interface Category {
  name: string;
  contacts: Contact[];
}

export interface Company {
  name: string;
  slug: string;
  description: string;
  primaryColor: string;
  logo: React.ReactNode;
}

