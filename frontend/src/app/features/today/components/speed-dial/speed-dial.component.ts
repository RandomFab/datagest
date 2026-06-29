import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { EntryType } from '../../models/entry.model';

@Component({
  selector: 'app-speed-dial',
  templateUrl: './speed-dial.component.html',
  styleUrl: './speed-dial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedDialComponent {
  typeSelected = output<EntryType>();
}
