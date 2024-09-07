//dashboard.module.ts
import { DashboardComponent } from "./dashboard.component";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { DashboardRoutes } from "./dashboard.routes";
import { NgIf } from "@angular/common";

@NgModule({
    declarations: [DashboardComponent],
    imports: [DashboardRoutes,FormsModule,ReactiveFormsModule,CommonModule,NgIf],
    providers: [/* CanActivePage*/],
  })
  export class DashboardModule { }
  