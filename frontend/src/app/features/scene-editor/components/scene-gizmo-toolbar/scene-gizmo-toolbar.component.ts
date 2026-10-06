import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type UnityGizmoTool = 'SELECT' | 'MOVE' | 'SCALE' | 'HOTSPOT';

@Component({
  selector: 'app-scene-gizmo-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scene-gizmo-toolbar.component.html',
  styleUrl: './scene-gizmo-toolbar.component.css'
})
export class SceneGizmoToolbarComponent {
  readonly activeTool = input<UnityGizmoTool>('SELECT');
  readonly hasSprite = input<boolean>(false);

  readonly toolChange = output<UnityGizmoTool>();

  selectTool(tool: UnityGizmoTool): void {
    this.toolChange.emit(tool);
  }
}
