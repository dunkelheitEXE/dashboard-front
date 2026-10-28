import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteForm } from './note-form';

describe('NoteForm', () => {
  let component: NoteForm;
  let fixture: ComponentFixture<NoteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteForm],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
