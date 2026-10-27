import { Action } from './action.model';
import { Hotspot } from './hotspot.model';

export interface Item {
  id?: number;
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  hotspot?: Hotspot | null;
  actions?: Action[];
}
