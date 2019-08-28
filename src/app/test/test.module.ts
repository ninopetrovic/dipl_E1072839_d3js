import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test.component';
import {TreeViewComponent, TreeViewModule, TreeView} from '@syncfusion/ej2-angular-navigations';
import {TestService} from './test.service';
import {RouterModule, Routes} from '@angular/router';
import {EurovocTestComponentTwo} from '../eurovoc_test_2/eurovoc_test_02.component';
import {DonutChartComponent} from '../07_donut_chart/donut-chart.component';

const testRouts: Routes = [
    { path: 'test-component/test-eurovoc2', component: DonutChartComponent }
];

@NgModule({
    imports: [
      CommonModule,
      TreeViewModule,
      RouterModule.forRoot(testRouts)
    ],
    declarations: [TestComponent, DonutChartComponent],
    providers: [TestService],
    exports: [TestComponent, TreeViewComponent]
})
export class TestModule { }
