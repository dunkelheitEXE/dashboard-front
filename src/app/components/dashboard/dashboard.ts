import { Component, inject, OnInit } from '@angular/core';
import { taskStatusLabel } from '../../services/notes.service';
import { NotesStore } from '../../services/notes.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly store = inject(NotesStore);

  protected readonly notes = this.store.notes;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;

  protected readonly statusLabel = taskStatusLabel;

  ngOnInit(): void {
    this.store.load();
  }
}
