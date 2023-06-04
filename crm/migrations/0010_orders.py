# Generated by Django 4.1.7 on 2023-04-12 14:25

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0009_alter_messages_options_alter_orders_options_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Orders',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('desc', models.TextField(max_length=500)),
                ('status', models.CharField(blank=True, choices=[('Заказано', 'Заказано'), ('Принято', 'Принято'), ('Сделано', 'Сделано'), ('Отправлено', 'Отправлено'), ('Доставлено', 'Доставлено'), ('Оплачено', 'Оплачено')], default='Заказано', max_length=15)),
                ('postdate', models.DateTimeField(default=django.utils.timezone.now)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='crm.clients')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='crm.account')),
            ],
            options={
                'ordering': ['-status', '-postdate'],
            },
        ),
    ]