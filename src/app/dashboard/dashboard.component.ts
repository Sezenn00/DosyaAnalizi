//dashboard.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
dashboard: any;
  constructor(private router: Router) {}

  navigateToUpload() {
    this.router.navigate(['/upload']);
  }
  
}
 