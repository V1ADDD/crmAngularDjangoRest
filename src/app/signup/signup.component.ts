import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";

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
  constructor(private http: HttpClient) {
  }

  onSubmit() {
    if (this.password == this.password2) {
      const url = 'https://127.0.0.1:8000/accounts';
      const data = {
        login: this.login,
        password: this.password
      };

      this.http.post(url, data).subscribe(response => {
        console.log(response);
      });
    }
  }
}
