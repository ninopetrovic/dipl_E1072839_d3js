import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatMenuModule, MatSidenavModule } from '@angular/material';

import { AppComponent } from './app.component';
import { LineChartComponent } from './01_line_chart/line-chart.component';
import { MultiSeriesComponent } from './02_multi_series_line_chart/multi-series.component';
import { BarChartComponent } from './03_bar_chart/bar-chart.component';
import { StackedBarChartComponent } from './04_stacked_bar_chart/stacked-bar-chart.component';
import { BrushZoomComponent } from './05_brush_zoom/brush-zoom.component';
import { PieChartComponent } from './06_pie_chart/pie-chart.component';
import { DonutChartComponent } from './07_donut_chart/donut-chart.component';
import {EurovocTestComponent} from './eurovoc_test_01/eurovoc_test_01.component';
import {HttpClient, HttpClientModule, HttpHandler} from '@angular/common/http';
import {EurovocTestComponentTwo} from 'src/app/eurovoc_test_2/eurovoc_test_02.component';
import {TestComponent} from './test/test.component';
import {CommonModule} from '@angular/common';
import {CookieService} from 'ngx-cookie-service';
import {TestModule} from './test/test.module';
import {LoginComponent} from './login/login.component';
import {LoginModule} from './login/login.module';
import {AuthGuardService as AuthGuard} from './auth/auth-guard.service';
import {TestService} from './test/test.service';

const appRoutes: Routes = [
    { path: 'line-chart', component: LineChartComponent },
    { path: 'multi-series', component: MultiSeriesComponent },
    { path: 'bar-chart', component: BarChartComponent },
    { path: 'stacked-bar-chart', component: StackedBarChartComponent },
    { path: 'brush-zoom', component: BrushZoomComponent },
    { path: 'linked-nodes', component: PieChartComponent },
    { path: 'test-eurovoc', component: EurovocTestComponent },
    { path: 'test-eurovoc2', component: EurovocTestComponentTwo },
    {
        path: 'test-component',
        component: TestComponent,
        canActivate: [AuthGuard],
        children: [{
            path: 'vizualize',
            component: EurovocTestComponentTwo
        }]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    { path: '',
        redirectTo: '/test-component',
        pathMatch: 'full',
    },
    { path: '**',
        redirectTo: '/test-component',
        pathMatch: 'full'
    }
];

@NgModule({
    declarations: [
        AppComponent,
        LineChartComponent,
        MultiSeriesComponent,
        BarChartComponent,
        StackedBarChartComponent,
        BrushZoomComponent,
        PieChartComponent,
        EurovocTestComponent,
        // EurovocTestComponentTwo,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes),
        MatMenuModule,
        MatSidenavModule,
        HttpClientModule,
        TestModule,
        LoginModule,
    ],
    providers: [
        CookieService,
        AuthGuard,
        TestService
    ],
    exports: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
