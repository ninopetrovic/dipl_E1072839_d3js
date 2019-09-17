import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptVisualizationComponent } from './concept-visualization.component';

describe('ConceptVisualizationComponent', () => {
  let component: ConceptVisualizationComponent;
  let fixture: ComponentFixture<ConceptVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConceptVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConceptVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
