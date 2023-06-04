import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {httpOptions} from "../app.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [DatePipe]
})
export class ProfileComponent {
  user: any;
  subs: any;
  users: any;
  phone: string | undefined;
  email: string | undefined;
  find: string | undefined;
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router, private datePipe: DatePipe) {
    if ('Authorization' in localStorage) {
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      this.http.get(this.backendURL + '/accounts/' + localStorage.getItem('Id'), httpOptions).subscribe(
        {
          next: (response: any) => {
            this.user = response;
            this.phone = this.user.phone;
            this.email = this.user.email;
            this.http.get(this.backendURL + '/accounts', httpOptions).subscribe(
              {
                next: (response: any) => {
                  this.users = response.users;
                }
              }
            );
          }
        }
      );
      this.http.get(this.backendURL + '/subscriptions', httpOptions).subscribe(
        {
          next: (response: any) => {
            this.subs = response;
          }
        }
      );
    } else
      this.router.navigate(['/signin']);
  }

  change_select() {
    let selected = <any>(<HTMLSelectElement>document.getElementById('select_sub')).value;
    if (selected != 4)
      (<HTMLDivElement>document.getElementById('posses')).innerText =
        this.subs[selected-1].possibilities;
    else
      (<HTMLDivElement>document.getElementById('posses')).innerText =
        this.subs[selected-2].possibilities;
    if (selected != this.user.sub) {
      (<HTMLDivElement>document.getElementById('posses')).innerText += "\nЦена: " + this.subs[selected - 1].price + " BYN/МЕС";
      (<HTMLDivElement>document.getElementById('buttonSubChange')).style.display = 'block';
    } else {
      (<HTMLDivElement>document.getElementById('posses')).innerText += "\nКУПЛЕНО";
      (<HTMLDivElement>document.getElementById('buttonSubChange')).style.display = 'none';
    }
  }

  subscribe() {
    if ((this.user.phone == null && this.user.email == null) || (this.user.phone == '' && this.user.email == '')) {
      alert("Для подключения другого тарифа, добавьте хотя бы один способ связи ниже!");
    } else {
      const botKey = "5855299007:AAEZjjXwhdhg16YFpAeiI1QxUdjpiv6mPok";
      console.log(this.users)
      for (let user of this.users) {
        if (user.isadmin)
        {
          try {
            this.http.get('https://api.telegram.org/bot' + botKey + '/sendMessage?chat_id=' + user.userChatId + '&text=' +
              "Пользователь "+this.user.login+" хотел бы приобрести подписку уровня '" +
              (<HTMLSelectElement>document.getElementById('select_sub')).options[(<HTMLSelectElement>document.getElementById('select_sub')).selectedIndex].text+"'" +
              ".%0AЕго данные для связи:%0AТелефон: "+this.user.phone+"%0AПочта: "+this.user.email).subscribe();
          }
          catch (e) {}
        }
      }
      // Отправка сообщения через ТГ бота админу
      alert("Ожидайте, в течение часа Вам отпишут по поводу оплаты на один из указанных ваших контактов)")
    }
  }

  update_user() {
    if (this.phone != this.user.phone || this.email != this.user.email) {
      const url = this.backendURL + '/accounts/' + localStorage.getItem('Id');
      const data = {
        phone: this.phone,
        email: this.email
      };
      this.http.put(url, data, httpOptions).subscribe(
        response => {
          window.location.reload();
        },
        error => {
        }
      )
    }
  }

  change_sub(id: any) {
    //put from admin
    let selected = <any>(<HTMLSelectElement>document.getElementById('select_sub' + id)).value;
    const url = this.backendURL + '/accounts/' + id;
    let data;
    if (selected == 'admin') {
      data = {
        isadmin: true
      };

    } else {
      console.log(this.datePipe.transform(new Date().setMonth(new Date().getMonth() + 1), "YYYY-MM-ddThh:mm"))
      data = {
        isadmin: false,
        sub: selected,
        sub_expires: this.datePipe.transform(new Date().setMonth(new Date().getMonth() + 1), "YYYY-MM-ddThh:mm"),
      };
    }
    this.http.put(url, data, httpOptions).subscribe(
      response => {
        window.location.reload();
      },
      error => {
        console.log(error)
      }
    )
  }
  find_users(){
    httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      this.http.get(this.backendURL + '/accounts/search?find=' + this.find, httpOptions).subscribe(
        {
          next: (response: any) => {
            this.users = response;
          }
        }
      );
  }

  addChatId() {
    const randomString = Math.random().toString(36).substring(2);
    const code = randomString.slice(0, 4).toUpperCase();
    const botKey = "5855299007:AAEZjjXwhdhg16YFpAeiI1QxUdjpiv6mPok";
    if (confirm("Отправьте код '"+code+"' боту t.me/crm_operations_bot и подтвердите.")) {
      this.http.get('https://api.telegram.org/bot' + botKey + "/getUpdates").subscribe(
            {
        next: (responseTg: any) => {
          try {
            const chatId = responseTg.result.filter((res: { message: { text: string; }; }) => res.message.text == code)[0].message.from.id;
            const url = this.backendURL + '/accounts/' + localStorage.getItem('Id');
            const data = {
              userChatId: chatId
            };
            this.http.put(url, data, httpOptions).subscribe(
              response => {
                alert("Успешно подключено!");
                const message: string = 'Поздравляем с началом использования нашего бота, надеюсь наши ежедневные уведомления будут вам полезны =)';
                this.http.get('https://api.telegram.org/bot' + botKey + '/sendMessage?chat_id=' + chatId + '&text=' + message).subscribe();
              },
              error => {
                alert("Ошибка!");
              }
            )
          }
          catch (e) {
            alert("Ошибка!");
          }
        },
        error: (err: any) => {
          alert("Ошибка!");
        }
      });
    }
  }
}
