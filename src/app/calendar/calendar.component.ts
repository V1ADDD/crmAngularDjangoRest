import {Component} from '@angular/core';
import {httpOptions} from "../app.component";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";


interface SpecialDate {
  day: number;
  desc: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  selectedYear: any
  selectedMonth: any
  days: any
  calendar: any
  years: any
  months: any
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router) {
    if ('Authorization' in localStorage) {
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      this.months = [
        {name: 'Январь', value: 1},
        {name: 'Февраль', value: 2},
        {name: 'Март', value: 3},
        {name: 'Апрель', value: 4},
        {name: 'Май', value: 5},
        {name: 'Июнь', value: 6},
        {name: 'Июль', value: 7},
        {name: 'Август', value: 8},
        {name: 'Сентябрь', value: 9},
        {name: 'Октябрь', value: 10},
        {name: 'Ноябрь', value: 11},
        {name: 'Декабрь', value: 12},
      ];
      this.years = [];
      for (let i = 2020; i <= 2050; i++) {
        this.years.push(i);
      }
      this.days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
      const now = new Date();
      this.selectedMonth = now.getMonth() + 1; // 0-indexed, so January is 0
      this.selectedYear = now.getFullYear();
      this.updateCalendar();
    }
    else{
      this.router.navigate(['/signin']);
    }
  }

  updateCalendar(year = this.selectedYear, month = this.selectedMonth - 1) {
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    let dayOfWeek = firstDayOfMonth.getDay();
    if (dayOfWeek == 0) {
      dayOfWeek = 7;
    }
    this.calendar = []
    for (let i = 1; i < dayOfWeek; i++) {
      this.calendar.push({
        day: null,
        isToday: false,
        isSelected: false,
        desc: ""
      })
    }
    let specialDays: SpecialDate[] = [];
    this.http.get(this.backendURL+'/orders', httpOptions).subscribe(
      {
        next: (response: any) => {
          for (let ord of response.orders) {
            let dateOrder = new Date(ord.postdate);
            if (month == dateOrder.getMonth() && year == dateOrder.getFullYear()) {
              const existingSpecialDay = specialDays.find(e => e.day == dateOrder.getDate());
              if (existingSpecialDay) {
                // If an event with the same date already exists, append the description to it
                existingSpecialDay.desc += '\nПолучен заказ:\n' + ord.desc;
              } else {
                specialDays.push(
                  {
                    day: dateOrder.getDate(),
                    desc: 'Получен заказ:\n' + ord.desc
                  });
              }
            }
          }
          this.http.get(this.backendURL+'/tasks', httpOptions).subscribe(
            {
              next: (response: any) => {
                for (let task of response.tasks) {
                  let dateTask = new Date();
                  dateTask.setDate(dateTask.getDate() + task.deadline);
                  if (month == dateTask.getMonth() && year == dateTask.getFullYear() && dateTask >= now) {
                    const existingSpecialDay = specialDays.find(e => e.day == dateTask.getDate());
                    if (existingSpecialDay) {
                      // If an event with the same date already exists, append the description to it
                      existingSpecialDay.desc += '\nДедлайн по задаче:\n' + task.desc;
                    } else {
                      specialDays.push(
                        {
                          day: dateTask.getDate(),
                          desc: 'Дедлайн по задаче:\n' + task.desc
                        });
                    }
                  }
                }
                const countDaysInMonth = new Date(year, month + 1, 0).getDate();
                for (let i = dayOfWeek; i < dayOfWeek + countDaysInMonth; i++) {
                  let foundDay = specialDays.find(e => e.day == i + 1 - dayOfWeek);
                  let newDay = {
                    day: i + 1 - dayOfWeek,
                    isToday: false,
                    isSelected: false,
                    desc: ""
                  }
                  if (today === i + 1 - dayOfWeek && currentMonth == month && currentYear == year) {
                    newDay.isToday = true;
                    newDay.desc = "Сегодня";
                    if (foundDay)
                      newDay.desc += "\n" + foundDay.desc;
                  } else if (foundDay) {
                    newDay.isSelected = true;
                    newDay.desc = foundDay.desc;
                  }
                  this.calendar.push(newDay);
                }
                let j = 36;
                if (dayOfWeek + countDaysInMonth > 36) {
                  j = 43;
                }
                for (let i = dayOfWeek + countDaysInMonth; i < j; i++) {
                  this.calendar.push({
                    day: null,
                    isToday: false,
                    isSelected: false
                  })
                }
              }
            }
          )
        }
      }
    )
  }

  redirectToCreateTask(day: number) {
    let dateForTask = new Date(this.selectedYear, this.selectedMonth-1, day+1);
    const queryParams = { date: dateForTask.toISOString() };
    this.router.navigate(['/todolist'], {queryParams});
  }
}
// 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
