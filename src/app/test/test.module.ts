import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test.component';
import {TreeViewComponent, TreeViewModule, TreeView} from '@syncfusion/ej2-angular-navigations';
import {TestService} from './test.service';
import {RouterModule, Routes} from '@angular/router';
import {EurovocTestComponentTwo} from '../eurovoc_test_2/eurovoc_test_02.component';
import {DonutChartComponent} from '../07_donut_chart/donut-chart.component';
import {AppModule} from '../app.module';
import {FormsModule} from '@angular/forms';
import {LabelFilterPipe} from '../shared/label.pipe';
import {AutoCompleteModule, DropDownListModule} from '@syncfusion/ej2-angular-dropdowns';

const testRouts: Routes = [
    { path: 'test-component/test-eurovoc2', component: DonutChartComponent }
];

@NgModule({
    imports: [
        CommonModule,
        TreeViewModule,
        RouterModule.forRoot(testRouts),
        FormsModule,
        AutoCompleteModule,
        DropDownListModule
    ],
    declarations: [
        TestComponent,
        DonutChartComponent,
        EurovocTestComponentTwo,
        LabelFilterPipe,
    ],
    providers: [TestService],
    exports: [TestComponent, TreeViewComponent, LabelFilterPipe]
})
export class TestModule { }
