import { ConceptVisualizationModule } from './concept-visualization.module';

describe('ConceptVisualizationModule', () => {
  let conceptVisualizationModule: ConceptVisualizationModule;

  beforeEach(() => {
    conceptVisualizationModule = new ConceptVisualizationModule();
  });

  it('should create an instance', () => {
    expect(conceptVisualizationModule).toBeTruthy();
  });
});
