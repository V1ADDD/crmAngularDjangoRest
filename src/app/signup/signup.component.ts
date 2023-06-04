import {Component, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {httpOptions} from "../app.component";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  FIO: string | undefined;
  login: string | undefined;
  password: string | undefined;
  password2: string | undefined;
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router) {
    if ('Authorization' in localStorage)
      this.router.navigate(['/menu']);
  }

  onSubmit() {
    if (this.password == this.password2) {
      const hash = CryptoJS.MD5(this.password + "d3289rfh28");
      const url = this.backendURL + '/accounts';
      const data = {
        FIO: this.FIO,
        login: this.login,
        password: hash.toString()
      };
      this.http.post(url, data).subscribe(
        response =>{
          this.router.navigate(['/signin']);
        },
      error => {
        alert("Неверные данные =(")
      }
      );
    }
  }
}
