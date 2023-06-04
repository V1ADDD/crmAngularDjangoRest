import datetime
import os
import time
import threading

from django.apps import AppConfig


def update_messages():
    import requests
    from crm.models import Account, Clients, Chats, Messages
    from datetime import datetime
    from django.db.models import Max
    from backend.settings import TG_API_KEY

    while True:

        for account in Account.objects.exclude(apiKey="").exclude(apiKey=None):
            response = requests.get(f"https://api.telegram.org/bot{account.apiKey}/getUpdates")
            responseTg = response.json()
            clients = Clients.objects.filter(account=account)

            for message in responseTg['result']:
                if clients.filter(name=message['message']['from']['username']).exists():
                    client = clients.get(name=message['message']['from']['username'])
                    max_date = Messages.objects.filter(chat__user=account, chat__client=client).aggregate(
                        Max('date'))
                    max_date_value = max_date['date__max']
                    max_date_value = max_date_value.timestamp()
                    if message['message']['date'] > max_date_value:
                        date_str = datetime.fromtimestamp(message['message']['date'] - 10800)
                        new_message = Messages(
                            chat=Chats.objects.get(user=account, client=client),
                            message=message['message']['text'],
                            to_client=False,
                            date=date_str
                        )
                        new_message.save()
                        chat = Chats.objects.get(user=account, client=client)
                        chat.read = False
                        chat.save()
                        response = requests.get(
                            f"https://api.telegram.org/bot{TG_API_KEY}/sendMessage?chat_id={account.userChatId}&text="
                            + "У вас новые сообщения от клиентов, не забудьте проверить!")
                else:
                    new_client = Clients(
                        name=message['message']['from']['username'],
                        info=message['message']['from']['id'],
                        account=account
                    )
                    new_client.save()
                    date_str = datetime.fromtimestamp(message['message']['date'] - 10800)
                    new_chat = Chats(
                        user=account,
                        client=new_client,
                        date_begin=date_str
                    )
                    new_chat.save()
                    new_message = Messages(
                        chat=new_chat,
                        message=message['message']['text'],
                        to_client=False,
                        date=date_str
                    )
                    new_message.save()
                    response = requests.get(
                        f"https://api.telegram.org/bot{TG_API_KEY}/sendMessage?chat_id={account.userChatId}&text="
                        + "У вас новые клиенты, проверьте чаты!")

        time.sleep(86400)


def check_sub():
    from crm.models import Account
    import requests
    from backend.settings import TG_API_KEY

    while True:
        for account in Account.objects.exclude(userChatId="").exclude(userChatId=None).filter(sub_id__gt=1):
            if account.sub_expires.timestamp() - datetime.datetime.now().timestamp() <= 604800:
                if account.sub_expires.timestamp() - datetime.datetime.now().timestamp() <= 86400:
                    if account.sub_expires.timestamp() - datetime.datetime.now().timestamp() <= 0:
                        response = requests.get(
                            f"https://api.telegram.org/bot{TG_API_KEY}/sendMessage?chat_id={account.userChatId}&text="
                            + "Подписка закончилась! Продлите её.")
                    else:
                        response = requests.get(
                            f"https://api.telegram.org/bot{TG_API_KEY}/sendMessage?chat_id={account.userChatId}&text="
                            + "До завершения действия вашей подписки осталось менее суток! Не забудьте её продлить!")
                else:
                    response = requests.get(
                        f"https://api.telegram.org/bot{TG_API_KEY}/sendMessage?chat_id={account.userChatId}&text="
                        + "До завершения действия вашей подписки осталось менее недели! Не забудьте её продлить!")

        time.sleep(86400)


def deadline_tasks():
    from crm.models import Tasks, Account
    import requests
    from backend.settings import TG_API_KEY

    while True:
        for account in Account.objects.filter(sub_id__gt=1):
            for task in Tasks.objects.filter(user=account):
                if 86400 >= task.deadline.timestamp() - datetime.datetime.now().timestamp() > 0 and task.status != "Выполнено":
                    response = requests.get(
                        f"https://api.telegram.org/bot{TG_API_KEY}/sendMessage?chat_id={account.userChatId}&text="
                        + f"До дедлайна по задаче '{task.name}' осталось менее суток, поторопитесь или откройте новую задачу!")

        time.sleep(86400)


def deadline_orders():
    from crm.models import Orders, Account
    import requests
    from backend.settings import TG_API_KEY

    while True:
        for account in Account.objects.filter(sub_id__gt=1):
            for order in Orders.objects.filter(user=account):
                if datetime.datetime.now().timestamp() - order.postdate.timestamp() >= 604800 and order.status != "Оплачено":
                    response = requests.get(
                        f"https://api.telegram.org/bot{TG_API_KEY}/sendMessage?chat_id={account.userChatId}&text="
                        + f"Заказ '{order.name}' был взят уже более недели назад, поторопитесь!")

        time.sleep(86400)


def start_async_thread():
    async_thread = threading.Thread(target=update_messages)
    async_thread.start()


def start_async_thread_sub():
    async_thread = threading.Thread(target=check_sub)
    async_thread.start()


def start_async_thread_tasks():
    async_thread = threading.Thread(target=deadline_tasks)
    async_thread.start()


def start_async_thread_orders():
    async_thread = threading.Thread(target=deadline_orders)
    async_thread.start()


class CrmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'crm'

    def ready(self):
        if os.environ.get('RUN_MAIN'):
            start_async_thread()
            start_async_thread_sub()
            start_async_thread_tasks()
            start_async_thread_orders()
