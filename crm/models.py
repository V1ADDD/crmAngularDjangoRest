from django.db import models
from django.utils import timezone


class Subscription(models.Model):
    name = models.CharField(
        max_length=100
    )
    price = models.FloatField()
    possibilities = models.TextField(
        max_length=500
    )

    def __str__(self):
        return self.name


class Account(models.Model):
    apiKey = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )
    userChatId = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )
    login = models.CharField(
        max_length=100
    )
    FIO = models.CharField(
        max_length=100
    )
    sub = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        default=1,
        blank=True
    )
    sub_expires = models.DateTimeField(
        blank=True,
        null=True
    )
    email = models.EmailField(
        max_length=200,
        blank=True,
        null=True
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )
    password = models.CharField(
        max_length=100
    )
    isadmin = models.BooleanField(
        default=False,
        blank=True
    )


class Clients(models.Model):
    name = models.CharField(
        max_length=100
    )
    info = models.TextField(
        max_length=500,
        blank=True,
        null=True
    )
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Orders(models.Model):
    name = models.CharField(
        max_length=100
    )
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    client = models.ForeignKey(Clients, on_delete=models.CASCADE)
    desc = models.TextField(
        max_length=500
    )
    STATUS_CHOICES = [
            ('Заказано', 'Заказано'),
            ('Принято', 'Принято'),
            ('Сделано', 'Сделано'),
            ('Отправлено', 'Отправлено'),
            ('Доставлено', 'Доставлено'),
            ('Оплачено', 'Оплачено'),
    ]
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='Заказано',
        blank=True
    )
    postdate = models.DateTimeField(
        default=timezone.now
    )

    class Meta:
        ordering = ['postdate']


class Tasks(models.Model):
    name = models.CharField(
        max_length=100
    )
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    desc = models.TextField(
        max_length=500
    )
    status = models.CharField(
        max_length=15,
        choices=[
            ('Открыто', 'Открыто'),
            ('Начато', 'Начато'),
            ('25%', '25%'),
            ('На полпути', 'На полпути'),
            ('Заканчиваю', 'Заканчиваю'),
            ('Выполнено', 'Выполнено'),
        ],
        default='Открыто',
        blank=True
    )
    deadline = models.DateTimeField()

    class Meta:
        ordering = ['-status', 'deadline']


class Chats(models.Model):
    socnet = models.CharField(
        max_length=15,
        choices=[
            ('Telegram', 'Telegram'),
            ('Email', 'Email'),
        ],
        default='Telegram',
        blank=True
    )
    user = models.ForeignKey(
        Account,
        on_delete=models.CASCADE
    )
    client = models.ForeignKey(
        Clients,
        on_delete=models.CASCADE
    )
    read = models.BooleanField(
        default=False,
        blank=True
    )
    date_begin = models.DateTimeField(
        default=timezone.now,
        blank=True
    )


class Messages(models.Model):
    chat = models.ForeignKey(
        Chats,
        on_delete=models.CASCADE
    )
    message = models.TextField(
        max_length=500
    )
    to_client = models.BooleanField(
        default=True,
        blank=True
    )
    date = models.DateTimeField(
        default=timezone.now,
        blank=True
    )

    class Meta:
        ordering = ['-date']
