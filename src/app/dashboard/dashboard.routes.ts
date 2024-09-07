// dashboard.routes.ts
import { DashboardComponent } from "./dashboard.component";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadFilePageComponent } from "../upload-file-page/upload-file-page.component";

const routes: Routes = [
    {
      path: '', component: DashboardComponent, children: [  
      { path: 'file-upload-page', component: UploadFilePageComponent }
      ]
    }    
];
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class DashboardRoutes { }
  