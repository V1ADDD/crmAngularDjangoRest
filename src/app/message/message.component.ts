import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {httpOptions} from "../app.component";
import * as moment from "moment/moment";
import {interval} from "rxjs";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  pk: any;
  chat: any;
  messages: any;
  message: string | undefined;
  user: any;
  chatId: number = 0;
  chatType: string = "Telegram";
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    if ('Authorization' in localStorage) {
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      this.http.get(this.backendURL+'/accounts/' + localStorage.getItem('Id'), httpOptions).subscribe(
        {
          next: (response: any) => {
            this.user = response;
            if (this.user.sub == 1) {
              if (!this.user.isadmin) {
                alert("Для доступа к данному разделу, нужна подписка уровня ТЕЛЕГРАМ и выше.")
                router.navigate(['/menu']);
              }
            }
          }
        });
      this.route.params.subscribe(params => {
        this.pk = params['id'];
      });
      this.http.get(this.backendURL+'/chats/' + this.pk, httpOptions).subscribe(
        {
          next: (response: any) => {
            this.chat = response;
            this.chatType = response.socnet;
            this.http.get(this.backendURL+'/clients/' + this.chat.client, httpOptions).subscribe(
              {
                next: (response: any) => {
                  this.chat.client = response.name;
                  this.chatId = response.info;
                }
              }
            );
          }
        }
      );
      this.http.get(this.backendURL+'/chats/' + this.pk + '/messages', httpOptions).subscribe(
        {
          next: (response: any) => {
            this.messages = response.messages;
            for (let mes of this.messages) {
              mes.date = moment(mes.date).format('M.DD.YYYY / H:mm:ss');
            }
          }
        }
      );
    } else
      this.router.navigate(['/signin']);
  }

  ngOnInit() {
    interval(1000).subscribe(() => {
      if (this.messages !== undefined && this.chat.client !== undefined) {
        const [datePart, timePart] = this.messages[0].date.split(' / ');
        // Extract date components
        const [month, day, year] = datePart.split('.');
        const [hour, minute, second] = timePart.split(':');

        // Create a new Date object with the specified components
        const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));

        // Get the Unix timestamp in seconds
        const timestamp = date.getTime() / 1000;
        console.log(timestamp);

        this.updateMessagesInChat(timestamp, this.chat.client);
      }
    });
  }

  updateMessagesInChat(lastMessageDate: number, chatClient: string) {
    if (this.chatType == 'Telegram') {
      this.http.get('https://api.telegram.org/bot' + this.user.apiKey + "/getUpdates").subscribe(
        {
          next: (responseTg: any) => {
            let messages = responseTg.result.filter(((mes: { message: { date: number; }; }) => mes.message.date > lastMessageDate));
            messages = messages.filter((mes: { message: { from: { username: string; }; }; }) => mes.message.from.username == chatClient);

            for (let message of messages) {
              const newMessage = {
                message: message.message.text,
                to_client: false,
                date: new DatePipe('en-US').transform(new Date(message.message.date * 1000), 'yyyy-MM-dd HH:mm:ss.SSSSSSZ', '+0300')
              }
              this.http.post(this.backendURL+'/chats/' + this.pk + '/messages', newMessage, httpOptions).subscribe(
                {
                  next: (response: any) => {
                    console.log(response);
                    this.http.get(this.backendURL+'/chats/' + this.pk + '/messages', httpOptions).subscribe(
                      {
                        next: (response: any) => {
                          this.messages = response.messages;
                          for (let mes of this.messages) {
                            mes.date = moment(mes.date).format('M.DD.YYYY / H:mm:ss');
                          }
                        }
                      }
                    );
                  }
                })
            }
          }
        });
    }
  }

  addZakaz() {
    const queryParams = { client: this.chat.client };
    this.router.navigate(['/orders'], {queryParams});
  }

  send_message() {
    const url = this.backendURL+'/chats/' + this.pk + '/messages';
    const data = {
      message: this.message
    };
    this.http.post(url, data, httpOptions).subscribe(
      response => {
        this.http.get(this.backendURL+'/chats/' + this.pk + '/messages', httpOptions).subscribe(
          {
            next: (response: any) => {
              this.messages = response.messages;
              for (let mes of this.messages) {
                mes.date = moment(mes.date).format('M.DD.YYYY / H:mm:ss');
              }
              if (this.chatType == 'Telegram') {
                this.http.get('https://api.telegram.org/bot' + this.user.apiKey + '/sendMessage?chat_id=' + this.chatId + '&text=' + this.message).subscribe();
              }
              this.message = "";
            }
          }
        );
      }
    )
  }
}
