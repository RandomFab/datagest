import { Component, ChangeDetectionStrategy, output, inject, signal, computed, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayService } from '../../services/today.service';
import { Entry, SYMPTOM_PRESETS } from '../../models/entry.model';

@Component({
  selector: 'app-add-symptom-sheet',
  imports: [FormsModule],
  templateUrl: './add-symptom-sheet.component.html',
  styleUrl: './add-symptom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSymptomSheetComponent {
  existingEntry = input<Entry | null>(null);
  closed = output<void>();

  private readonly svc = inject(TodayService);

  readonly presets = SYMPTOM_PRESETS;
  selectedPreset = signal<string | null>(null);
  customName = signal('');
  intensity = signal(5);
  entryTime = signal<string>(this.currentTime());

  readonly symptomName = computed(() => this.selectedPreset() ?? this.customName());

  readonly intensityLabel = computed(() => {
    const v = this.intensity();
    if (v <= 3) return 'mild';
    if (v <= 6) return 'moderate';
    return 'severe';
  });

  constructor() {
    effect(() => {
      const e = this.existingEntry();
      if (e) {
        this.entryTime.set(e.time);
        this.intensity.set(e.intensity ?? 5);
        if (SYMPTOM_PRESETS.includes(e.name)) {
          this.selectedPreset.set(e.name);
        } else {
          this.customName.set(e.name);
        }
      }
    });
  }

  get isEditing(): boolean {
    return this.existingEntry() !== null;
  }

  selectPreset(name: string): void {
    this.selectedPreset.set(name);
    this.customName.set('');
  }

  onCustomInput(value: string): void {
    this.customName.set(value);
    this.selectedPreset.set(null);
  }

  onIntensityChange(value: string): void {
    this.intensity.set(Number(value));
  }

  confirm(): void {
    const name = this.symptomName().trim();
    if (!name) return;
    const entryData = {
      type: 'symptom' as const,
      name,
      detail: `Intensity ${this.intensity()} / 10 · ${this.intensityLabel()}`,
      intensity: this.intensity(),
    };

    const existing = this.existingEntry();
    if (existing) {
      this.svc.updateEntry({ ...existing, ...entryData, time: this.entryTime() });
    } else {
      this.svc.addEntry({
        ...entryData,
        time: this.entryTime(),
        date: this.svc.formatDate(this.svc.currentDate()),
      });
    }
    this.closed.emit();
  }

  private currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }
}
