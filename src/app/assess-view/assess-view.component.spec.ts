import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessViewComponent } from './assess-view.component';

describe('AssessViewComponent', () => {
  let component: AssessViewComponent;
  let fixture: ComponentFixture<AssessViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssessViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
