import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const SHAPE = [
  '.....#.....',
  '....###....',
  '....###....',
  '###########',
  '.#########.',
  '..#######..',
  '..#######..',
  '.####.####.',
  '.###...###.',
  '##.......##'
];

function buildPath(maxColumn: number): string {
  let path = '';
  SHAPE.forEach((row, y) => {
    let x = 0;
    while (x < maxColumn) {
      if (row[x] !== '#') {
        x++;
        continue;
      }
      const start = x;
      while (x < maxColumn && row[x] === '#') {
        x++;
      }
      path += `M${start} ${y}h${x - start}v1h-${x - start}z`;
    }
  });
  return path;
}

const FULL_PATH = buildPath(11);
const HALF_PATH = buildPath(6);

@Component({
  selector: 'app-pixel-star',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 11 10" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
      <path class="empty" [attr.d]="fullPath" />
      @if (fill() > 0) {
        <path class="filled" [attr.d]="fill() >= 1 ? fullPath : halfPath" />
      }
    </svg>
  `,
  styleUrl: './pixel-star.component.css'
})
export class PixelStarComponent {
   readonly fill = input<number>(0);

  readonly fullPath = FULL_PATH;
  readonly halfPath = HALF_PATH;
}
