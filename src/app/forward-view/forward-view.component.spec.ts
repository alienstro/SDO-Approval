import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardViewComponent } from './forward-view.component';

describe('ForwardViewComponent', () => {
  let component: ForwardViewComponent;
  let fixture: ComponentFixture<ForwardViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForwardViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForwardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
