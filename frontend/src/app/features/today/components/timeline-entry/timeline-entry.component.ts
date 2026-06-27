import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-timeline-entry',
  templateUrl: './timeline-entry.component.html',
  styleUrl: './timeline-entry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineEntryComponent {
  entry = input.required<Entry>();
  tapped = output<Entry>();
}
