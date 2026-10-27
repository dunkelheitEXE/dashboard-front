import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TASK_STATUSES, TaskStatus } from '../../services/notes.service';
import { NotesStore } from '../../services/notes.store';

@Component({
  selector: 'app-create-note',
  imports: [ReactiveFormsModule],
  styleUrl: './create-note.css',
  templateUrl: './create-note.html',
})
export class CreateNote {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(NotesStore);
  private readonly auth = inject(AuthService);

  private readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly statuses = TASK_STATUSES;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    status: ['todo' as TaskStatus, [Validators.required]],
    start_date: [''],
    end_date: [''],
    content: [''],
  });

  /** Abre el modal (lo llama el contenedor desde el botón "+"). */
  open(): void {
    this.form.reset({
      title: '',
      status: 'todo',
      start_date: '',
      end_date: '',
      content: '',
    });
    this.error.set(null);
    this.loading.set(false);
    this.dialogRef().nativeElement.showModal();
  }

  protected close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { title, status, start_date, end_date, content } =
      this.form.getRawValue();

    this.store
      .create({
        title,
        status,
        author: this.auth.user()?.id ?? null,
        content: content || null,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.close();
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.error ?? 'No se pudo crear la nota');
        },
      });
  }
}
