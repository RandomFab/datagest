import {
  Component, ChangeDetectionStrategy, output, inject,
  signal, computed, input, effect, ElementRef, DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayService } from '../../services/today.service';
import { Entry, EntryType } from '../../models/entry.model';

type Preparation = 'raw' | 'cooked';
type Quantity = 'small' | 'normal' | 'large';

@Component({
  selector: 'app-edit-food-sheet',
  imports: [FormsModule],
  templateUrl: './edit-food-sheet.component.html',
  styleUrl: './edit-food-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFoodSheetComponent {
  entryType = input<EntryType>('food');
  existingEntry = input.required<Entry>();
  closed = output<void>();

  private readonly svc = inject(TodayService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTab = computed(() => this.entryType());
  foodName = signal('');
  preparation = signal<Preparation>('raw');
  quantity = signal<Quantity>('normal');
  volumeMl = signal<number | undefined>(undefined);
  entryTime = signal<string>(this.currentTime());

  constructor() {
    this.trackKeyboardOffset();

    effect(() => {
      const e = this.existingEntry();
      this.entryTime.set(e.time);
      this.foodName.set(e.name);
      if (e.type === 'food') {
        const lower = (e.detail ?? '').toLowerCase();
        this.preparation.set(lower.includes('cooked') ? 'cooked' : 'raw');
        this.quantity.set(lower.includes('large') ? 'large' : lower.includes('small') ? 'small' : 'normal');
      }
    });
  }

  confirm(): void {
    const type = this.activeTab() as 'food' | 'drink';
    this.svc.updateFoodEntry(this.existingEntry(), {
      preparation: type === 'food' ? this.preparation() : undefined,
      quantity: type === 'food' ? this.quantity() : undefined,
      time: this.entryTime(),
    }).subscribe({ next: () => this.closed.emit(), error: (e) => console.error(e) });
  }

  private currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }

  /** Keeps the sheet above the on-screen keyboard: mobile browsers shrink the
   * visual viewport but not the layout viewport, so a `bottom: 0` sheet ends up
   * hidden behind the keyboard unless we offset it manually. */
  private trackKeyboardOffset(): void {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      this.elementRef.nativeElement.style.setProperty('--keyboard-offset', `${offset}px`);
    };

    viewport.addEventListener('resize', updateOffset);
    viewport.addEventListener('scroll', updateOffset);
    updateOffset();

    this.destroyRef.onDestroy(() => {
      viewport.removeEventListener('resize', updateOffset);
      viewport.removeEventListener('scroll', updateOffset);
    });
  }
}
