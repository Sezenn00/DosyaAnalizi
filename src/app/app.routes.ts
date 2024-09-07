 //app.routes.ts
 import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';
  import { DashboardComponent } from './dashboard/dashboard.component';
  import { UploadFilePageComponent } from './upload-file-page/upload-file-page.component';
  
  export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'upload', component: UploadFilePageComponent }
  ];
  
  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
  