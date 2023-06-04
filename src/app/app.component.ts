import { Component } from '@angular/core';
import {HttpHeaders} from "@angular/common/http";


export const httpOptions = {
  headers: new HttpHeaders()
};
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'crm-front';
}
