# Generated by Django 4.1.7 on 2023-05-10 07:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0011_alter_orders_options_account_apikey_clients_account'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chats',
            name='socnet',
            field=models.CharField(blank=True, choices=[('Telegram', 'Telegram'), ('Email', 'Email'), ('Instagram', 'Instagram')], default='Telegram', max_length=15),
        ),
    ]
