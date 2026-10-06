import { Item } from './item.model';

export interface Scene {
  code: string;
  name: string;
  backgroundImageUrl?: string;
  items?: Item[];
}
