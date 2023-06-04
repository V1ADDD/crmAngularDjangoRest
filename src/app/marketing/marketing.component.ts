import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {httpOptions} from "../app.component";

@Component({
  selector: 'app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css']
})
export class MarketingComponent {
  countCurrentOrders: number = 0;
  moreOrLess: string = "";
  differenceInOrders: string = "";
  tasksAvailable: any;
  ordersByMonths: any;
  ordersInYear: any;
  questions: any;
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router) {
    if ('Authorization' in localStorage) {
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      let currentDate = new Date();
      this.countOrdersInMonth(currentDate.getFullYear(), currentDate.getMonth()).then((ordersInMonth) => {
        this.countCurrentOrders = ordersInMonth;
      }).catch((err) => {
        console.log(err);
      });
      this.countOrdersInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1).then((ordersInMonth) => {
        if (this.countCurrentOrders > ordersInMonth) {
          this.moreOrLess = "больше";
          this.differenceInOrders = ((this.countCurrentOrders - ordersInMonth) * 100 / this.countCurrentOrders).toFixed(2);
        } else if (this.countCurrentOrders == ordersInMonth)
          this.moreOrLess = "не больше и не меньше";
        else {
          this.moreOrLess = "меньше";
          this.differenceInOrders = ((ordersInMonth - this.countCurrentOrders) * 100 / ordersInMonth).toFixed(2);
        }
      }).catch((err) => {
        console.log(err);
      });
      this.countTasksAvailable().then((tasksAvailable) => {
        this.tasksAvailable = tasksAvailable;
      }).catch((err) => {
        console.log(err);
      });
      this.ordersByMonths = [];
      this.ordersInYear = 0;
      for (let i = 0; i < 12; i++) {
        this.countOrdersInMonth(new Date().getFullYear(), i).then((ordersInMonths) => {
          this.ordersByMonths.push(
            {
              label: new Date(2023, i).toLocaleString('default', {month: 'long'}).charAt(0).toUpperCase(),
              ordersCount: ordersInMonths
            }
          );
          this.ordersInYear += ordersInMonths;
        }).catch((err) => {
          console.log(err);
        });
      }
      this.questions = [
        {
          title: "Как продвигать свой продукт и увеличить продажи?",
          desc: [
            "Изучите свою целевую аудиторию. Исследуйте своих клиентов, выявите их проблемы, потребности и желания, и настройте свою маркетинговую стратегию под них.",
            "Определите свою уникальную продажу. Определите, чем вы отличаетесь от конкурентов и почему ваш продукт стоит выбрать.",
            "Определите свою ценовую политику. Подумайте о том, какую цену можно предложить, чтобы ваш продукт был конкурентоспособным, но и прибыльным для вашего бизнеса.",
            "Разработайте маркетинговую стратегию. Используйте различные каналы для привлечения клиентов, такие как реклама, социальные сети, SEO и контент-маркетинг.",
            "Анализируйте результаты. Это поможет понять, что работает и что не работает, и внести соответствующие изменения для улучшения продаж."
          ]
        },
        {
          title: "Как оптимизировать бизнес-процессы и управлять своим временем?",
          desc: [
            "Определите свои цели и приоритеты. Разбейте свои цели на более мелкие задачи, установите приоритеты и распределите время на их выполнение.",
            "Используйте инструменты для управления временем. Существует множество инструментов, которые могут помочь в управлении временем, такие как планировщики задач, управление электронной почтой и многие другие.",
            "Автоматизируйте бизнес-процессы. Многие рутинные задачи можно автоматизировать, чтобы сэкономить время и уменьшить возможность ошибок.",
            "Используйте аутсорсинг. Если у вас есть задачи, которые можно делегировать другим людям, то это может сэкономить ваше время. Рассмотрите возможность использования услуг аутсорсинговых компаний или найма временного персонала.",
            "Анализируйте и оптимизируйте бизнес-процессы. Постоянно анализируйте свои бизнес-процессы, ищите возможности для оптимизации и автоматизации, чтобы сэкономить время и деньги."
          ]
        },
        {
          title: "Каковы основные элементы успешного маркетингового плана и как их разработать?",
          desc: [
            "Определите целевую аудиторию и изучите ее потребности и предпочтения",
            "Разработайте уникальное предложение продукта или услуги",
            "Определите маркетинговые цели и установите показатели их достижимости",
            "Разработайте стратегию продвижения продукта или услуги",
            "Определите бюджет маркетинговой кампании и распределите его между различными маркетинговыми каналами",
            "Оцените эффективность маркетинговых действий и сделайте корректировки при необходимости"
          ]
        },
        {
          title: "Как увеличить лояльность клиентов и улучшить их удовлетворенность продуктом или услугой?",
          desc: [
            "Предоставьте высокое качество продукта или услуги",
            "Обеспечьте быстрый и качественный сервис",
            "Улучшайте связь с клиентами и отвечайте на их обратную связь",
            "Предоставляйте персонализированный сервис и рассматривайте каждого клиента как уникальный случай",
            "Развивайте программы лояльности и предлагайте бонусы и скидки",
            "Анализируйте данные о клиентах и используйте их для улучшения качества продукта или услуги"
          ]
        },
        {
          title: "Как привлечь новых клиентов и удержать существующих?",
          desc: [
            "Анализируйте целевую аудиторию и определяйте потребности клиентов",
            "Разрабатывайте маркетинговые кампании и стратегии, нацеленные на привлечение новых клиентов и удержание существующих",
            "Используйте инструменты рекламы и продвижения для привлечения новых клиентов",
            "Развивайте системы лояльности и удержания клиентов, такие как бонусные программы и персонализированные предложения",
            "Анализируйте обратную связь от клиентов для постоянного улучшения качества продукта или услуги."
          ]
        },
        {
          title: "Как эффективно управлять командой и мотивировать ее на успех?",
          desc: [
            "Определяйте конкретные цели и задачи команды",
            "Разрабатывайте эффективные системы управления, включая распределение обязанностей и установление четких целей и сроков выполнения задач",
            "Поддерживайте коммуникации и сотрудничество между членами команды",
            "Оценивайте производительность и результаты работы каждого члена команды",
            "Используйте мотивационные инструменты, такие как бонусы, повышение заработной платы или возможности карьерного роста."
          ]
        },
      ]
    } else {
      this.router.navigate(['/signin']);
    }
  }

  countOrdersInMonth(year: number, month: number): Promise<number> {
    if (month < 0)
      year -= 1;
    month = new Date(year, month).getMonth();
    return new Promise((resolve, reject) => {
      let ordersInMonth = 0;
      this.http.get(this.backendURL+'/orders', httpOptions).subscribe(
        {
          next: (response: any) => {
            for (let ord of response.orders) {
              let dateOrder = new Date(ord.postdate);
              if (year == dateOrder.getFullYear() && month == dateOrder.getMonth())
                ordersInMonth += 1;
            }
            resolve(ordersInMonth);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

  countTasksAvailable() {
    return new Promise((resolve, reject) => {
      let tasksAvailable: number = 0;
      this.http.get(this.backendURL+'/tasks', httpOptions).subscribe(
        {
          next: (response: any) => {
            for (let task of response.tasks) {
              if (task.deadline > 0 && task.status != 'Выполнено')
                tasksAvailable += 1;
            }
            resolve(tasksAvailable);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

}
