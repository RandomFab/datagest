import { Component, ChangeDetectionStrategy, output, inject, signal, input, effect } from '@angular/core';
import { TodayService } from '../../services/today.service';
import { Entry, BRISTOL_TYPES } from '../../models/entry.model';

@Component({
  selector: 'app-add-stool-sheet',
  templateUrl: './add-stool-sheet.component.html',
  styleUrl: './add-stool-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStoolSheetComponent {
  existingEntry = input<Entry | null>(null);
  closed = output<void>();

  private readonly svc = inject(TodayService);

  readonly bristolTypes = BRISTOL_TYPES;
  selectedType = signal<number | null>(null);
  entryTime = signal<string>(this.currentTime());

  constructor() {
    effect(() => {
      const e = this.existingEntry();
      if (e) {
        this.entryTime.set(e.time);
        if (e.bristolType != null) this.selectedType.set(e.bristolType);
      }
    });
  }

  get isEditing(): boolean {
    return this.existingEntry() !== null;
  }

  select(type: number): void {
    this.selectedType.set(type);
  }

  confirm(): void {
    const t = this.selectedType();
    if (t === null) return;
    const bristol = BRISTOL_TYPES.find(b => b.type === t)!;
    const existing = this.existingEntry();

    if (existing) {
      this.svc.updateStoolEntry(existing, t, bristol.quality, this.entryTime())
        .subscribe({ next: () => this.closed.emit(), error: (e) => console.error(e) });
    } else {
      this.svc.addStoolEntry(t, bristol.quality, this.entryTime())
        .subscribe({ next: () => this.closed.emit(), error: (e) => console.error(e) });
    }
  }

  private currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }
}
