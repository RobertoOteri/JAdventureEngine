import { Item } from './item.model';

export interface Scene {
  id?: number;
  code: string;
  name: string;
  backgroundImageUrl?: string;
  items?: Item[];
}
