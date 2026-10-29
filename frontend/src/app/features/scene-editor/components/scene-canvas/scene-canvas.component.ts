import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStore } from '../../store/editor.store';
import { Item } from '../../../../core/models';
import { SceneGizmoToolbarComponent, UnityGizmoTool } from '../scene-gizmo-toolbar/scene-gizmo-toolbar.component';

export interface Point2D {
  x: number;
  y: number;
}

@Component({
  selector: 'app-scene-canvas',
  standalone: true,
  imports: [CommonModule, SceneGizmoToolbarComponent],
  templateUrl: './scene-canvas.component.html',
  styleUrl: './scene-canvas.component.css'
})
export class SceneCanvasComponent {
  readonly store = inject(EditorStore);

  readonly isEditingOrCreating = input<boolean>(false);
  readonly editingItemCode = input<string | null>(null);
  readonly previewSpriteUrl = input<string | null>(null);

  readonly spritePosX = input<number>(350);
  readonly spritePosY = input<number>(350);
  readonly spriteWidth = input<number>(200);
  readonly spriteHeight = input<number>(200);

  readonly transformChange = output<{ posX: number; posY: number; width: number; height: number }>();
  readonly fileDropped = output<{ file: File; x: number; y: number }>();
  readonly createSceneRequested = output<void>();

  @ViewChild('svgCanvas') svgCanvasRef!: ElementRef<SVGSVGElement>;
  @ViewChild('gizmoBox') gizmoBoxRef?: ElementRef<HTMLDivElement>;

  readonly activeTool = signal<UnityGizmoTool>('SELECT');
  readonly draftPoints = signal<Point2D[]>([]);
  readonly isSceneImageLoading = signal<boolean>(true);
  readonly isDragOverScene = signal<boolean>(false);

  private isInteractingGizmo = false;
  private gizmoAction: 'MOVE' | 'SCALE' | null = null;
  private dragAxis: 'X' | 'Y' | 'BOTH' | null = null;
  private startMouse = { x: 0, y: 0 };
  private startPos = { x: 0, y: 0 };
  private startDimensions = { w: 0, h: 0 };
  private currentDelta = { x: 0, y: 0 };

  readonly showUnityToolbar = computed(() => {
    return this.isEditingOrCreating() || this.previewSpriteUrl() !== null;
  });

  readonly currentHasSprite = computed(() => {
    return this.previewSpriteUrl() !== null || !!this.store.selectedItem()?.imageUrl;
  });

  readonly draftPolygonPoints = computed(() => {
    return this.draftPoints().map((p) => `${p.x},${p.y}`).join(' ');
  });

  constructor() {
    effect(() => {
      if (this.store.backgroundUrl()) {
        this.isSceneImageLoading.set(true);
      }
    });
  }

  onSceneImageLoaded(): void {
    this.isSceneImageLoading.set(false);
  }

  setTool(tool: UnityGizmoTool): void {
    this.activeTool.set(tool);
  }

  onSvgClick(event: MouseEvent): void {
    if (this.activeTool() !== 'HOTSPOT') return;

    const svg = this.svgCanvasRef?.nativeElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 1000);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 1000);

    this.draftPoints.update((pts) => [...pts, { x, y }]);
  }

  undoLastPoint(): void {
    this.draftPoints.update((pts) => (pts.length > 0 ? pts.slice(0, -1) : pts));
  }

  clearDraftPoints(): void {
    this.draftPoints.set([]);
  }

  setDraftPoints(points: Point2D[]): void {
    this.draftPoints.set(points);
  }

  onSelectItem(event: MouseEvent, item: Item): void {
    if (this.activeTool() === 'HOTSPOT' || this.isInteractingGizmo) return;
    event.stopPropagation();
    this.store.selectItem(item);
    this.setTool('SELECT');
  }

  onSceneDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOverScene.set(true);
  }

  onSceneDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOverScene.set(false);
  }

  onSceneDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOverScene.set(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const svg = this.svgCanvasRef?.nativeElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const dropX = Math.round(((event.clientX - rect.left) / rect.width) * 1000);
    const dropY = Math.round(((event.clientY - rect.top) / rect.height) * 1000);

    this.fileDropped.emit({ file, x: dropX, y: dropY });
    this.setTool('MOVE');
  }

  startAxisDrag(event: MouseEvent, axis: 'X' | 'Y' | 'BOTH'): void {
    event.stopPropagation();
    event.preventDefault();

    this.isInteractingGizmo = true;
    this.gizmoAction = 'MOVE';
    this.dragAxis = axis;
    this.startMouse = { x: event.clientX, y: event.clientY };
    this.startPos = { x: this.spritePosX(), y: this.spritePosY() };
    this.currentDelta = { x: 0, y: 0 };
  }

  startScaleDrag(event: MouseEvent, axis: 'X' | 'Y' | 'BOTH'): void {
    event.stopPropagation();
    event.preventDefault();

    this.isInteractingGizmo = true;
    this.gizmoAction = 'SCALE';
    this.dragAxis = axis;
    this.startMouse = { x: event.clientX, y: event.clientY };
    this.startDimensions = { w: this.spriteWidth(), h: this.spriteHeight() };
    this.startPos = { x: this.spritePosX(), y: this.spritePosY() };
    this.currentDelta = { x: 0, y: 0 };
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (!this.isInteractingGizmo || !this.gizmoAction || !this.dragAxis) return;

    const svg = this.svgCanvasRef?.nativeElement;
    const targetEl = this.gizmoBoxRef?.nativeElement;
    if (!svg || !targetEl) return;

    const rect = svg.getBoundingClientRect();
    const deltaX = Math.round(((event.clientX - this.startMouse.x) / rect.width) * 1000);
    const deltaY = Math.round(((event.clientY - this.startMouse.y) / rect.height) * 1000);

    if (this.gizmoAction === 'MOVE') {
      this.currentDelta.x = (this.dragAxis === 'X' || this.dragAxis === 'BOTH') ? deltaX : 0;
      this.currentDelta.y = (this.dragAxis === 'Y' || this.dragAxis === 'BOTH') ? deltaY : 0;

      const pxX = (this.currentDelta.x / 1000) * rect.width;
      const pxY = (this.currentDelta.y / 1000) * rect.height;
      targetEl.style.transform = `translate3d(${pxX}px, ${pxY}px, 0)`;
    } else {
      let factorX = 1;
      let factorY = 1;

      if (this.dragAxis === 'X' || this.dragAxis === 'BOTH') {
        factorX = Math.max(0.05, (this.startDimensions.w + deltaX) / this.startDimensions.w);
      }
      if (this.dragAxis === 'Y' || this.dragAxis === 'BOTH') {
        factorY = Math.max(0.05, (this.startDimensions.h + deltaY) / this.startDimensions.h);
      }

      this.currentDelta.x = Math.round(this.startDimensions.w * factorX) - this.startDimensions.w;
      this.currentDelta.y = Math.round(this.startDimensions.h * factorY) - this.startDimensions.h;

      targetEl.style.transform = `scale(${factorX}, ${factorY})`;
      targetEl.style.transformOrigin = 'top left';
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    if (!this.isInteractingGizmo) return;
    this.isInteractingGizmo = false;

    const targetEl = this.gizmoBoxRef?.nativeElement;
    if (targetEl) {
      targetEl.style.transform = '';
      targetEl.style.transformOrigin = '';
    }

    let nextPosX = this.spritePosX();
    let nextPosY = this.spritePosY();
    let nextW = this.spriteWidth();
    let nextH = this.spriteHeight();

    if (this.gizmoAction === 'MOVE') {
      nextPosX = Math.max(0, Math.min(1000 - nextW, this.startPos.x + this.currentDelta.x));
      nextPosY = Math.max(0, Math.min(1000 - nextH, this.startPos.y + this.currentDelta.y));
    } else if (this.gizmoAction === 'SCALE') {
      nextW = Math.max(20, Math.min(1000 - this.startPos.x, this.startDimensions.w + this.currentDelta.x));
      nextH = Math.max(20, Math.min(1000 - this.startPos.y, this.startDimensions.h + this.currentDelta.y));
    }

    this.gizmoAction = null;
    this.dragAxis = null;

    this.transformChange.emit({
      posX: Math.round(nextPosX),
      posY: Math.round(nextPosY),
      width: Math.round(nextW),
      height: Math.round(nextH)
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      if (this.draftPoints().length > 0) {
        event.preventDefault();
        this.undoLastPoint();
      }
    }
  }
}
