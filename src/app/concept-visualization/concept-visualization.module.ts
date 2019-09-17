import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptVisualizationComponent } from './concept-visualization.component';
import {TestService} from '../test/test.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ConceptVisualizationComponent],
    providers: [TestService],
    exports: [ConceptVisualizationComponent]
})
export class ConceptVisualizationModule { }
