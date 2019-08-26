import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test.component';
import {TreeViewModule} from '@syncfusion/ej2-angular-navigations';

@NgModule({
  imports: [
      CommonModule,
      TreeViewModule
  ],
  declarations: [TestComponent]
})
export class TestModule { }
