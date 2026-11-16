import { Component, input, output, signal } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';


export type UnityGizmoTool = 'SELECT' | 'MOVE' | 'SCALE' | 'HOTSPOT';

@Component({
  selector: 'app-scene-gizmo-toolbar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './scene-gizmo-toolbar.component.html',
  styleUrl: './scene-gizmo-toolbar.component.css',
  host: {
    '[class.is-collapsed]': 'collapsed()'
  }
})
export class SceneGizmoToolbarComponent {
  readonly activeTool = input<UnityGizmoTool>('SELECT');
  readonly hasSprite = input<boolean>(false);
  readonly draftPointsCount = input<number>(0);

  readonly toolChange = output<UnityGizmoTool>();
  readonly undoPoint = output<void>();
  readonly clearPoints = output<void>();

  readonly collapsed = signal(false);

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  selectTool(tool: UnityGizmoTool): void {
    this.toolChange.emit(tool);
  }
}
