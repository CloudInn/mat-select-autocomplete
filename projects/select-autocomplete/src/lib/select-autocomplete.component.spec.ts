import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';

import { SelectAutocompleteComponent } from './select-autocomplete.component';
import { SelectAutocompleteModule } from './select-autocomplete.module';

const LONG_OPTION_NAME = 'TDS Travel TRAVEL DESTINATIONS SOLUTIONS';

@Component({
  standalone: false,
  template: `
    <mat-select-autocomplete
      [options$]="options$"
      [multiple]="true"
      [display]="'name'"
      [value]="'id'"
      [selectedOptions]="[]"
      [fieldFormControl]="control"
      [ElementWidth]="'150px'"
      placeholder="Channel">
    </mat-select-autocomplete>`,
})
class HostComponent {
  @ViewChild(SelectAutocompleteComponent) select: SelectAutocompleteComponent;
  control = new FormControl();
  options$: Observable<any[]> = of([
    { id: 1, name: 'ET Global' },
    { id: 2, name: LONG_OPTION_NAME },
  ]);
}

describe('SelectAutocompleteComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HostComponent],
      imports: [
        SelectAutocompleteModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function openPanel(): void {
    const host: HTMLElement = fixture.nativeElement.querySelector('.mat-mdc-select');
    host.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  function optionFor(text: string): HTMLElement {
    return Array.from(document.querySelectorAll<HTMLElement>('.mat-mdc-option'))
      .find(el => el.textContent.indexOf(text) !== -1);
  }

  it('should create', () => {
    expect(fixture.componentInstance.select).toBeTruthy();
  });

  it('renders an option tall enough to show a long name in full', fakeAsync(() => {
    openPanel();

    const option = optionFor(LONG_OPTION_NAME);
    expect(option).withContext('long option should be rendered').toBeTruthy();

    const label = option.querySelector<HTMLElement>('.mdc-list-item__primary-text') || option;
    expect(label.getBoundingClientRect().height)
      .withContext('the long name has to wrap for this test to mean anything')
      .toBeGreaterThan(24);

    expect(option.scrollHeight)
      .withContext('option clips its label: fixed row height is shorter than the wrapped text')
      .toBeLessThanOrEqual(option.clientHeight);

    flush();
  }));

  it('does not justify option text', fakeAsync(() => {
    openPanel();

    const container = document.querySelector<HTMLElement>('.mat-mdc-select-panel .options-container');
    expect(container).withContext('options container should be rendered').toBeTruthy();
    expect(getComputedStyle(container).textAlign)
      .withContext('justified text stretches word gaps and garbles multi-word names')
      .not.toBe('justify');

    flush();
  }));
});
