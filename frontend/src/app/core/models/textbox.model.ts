export interface TextBox {
  posX: number;
  posY: number;
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
  color: string;
}

export const TEXTBOX_GRID = 1000;

export const DEFAULT_TEXTBOX: Readonly<TextBox> = {
  posX: 400,
  posY: 460,
  width: 200,
  height: 60,
  fontFamily: 'Arial',
  fontSize: 16,
  color: '#ffffff'
};

export function normalizeTextBox(raw?: Partial<TextBox> | null): TextBox {
  const d = DEFAULT_TEXTBOX;
  return {
    posX: raw?.posX ?? d.posX,
    posY: raw?.posY ?? d.posY,
    width: raw?.width ?? d.width,
    height: raw?.height ?? d.height,
    fontFamily: raw?.fontFamily ?? d.fontFamily,
    fontSize: raw?.fontSize ?? d.fontSize,
    color: raw?.color ?? d.color
  };
}
