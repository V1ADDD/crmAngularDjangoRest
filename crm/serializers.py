from rest_framework import serializers

from crm.models import Account, Subscription, Clients, Chats, Orders, Tasks


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'


class ClientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clients
        fields = '__all__'


class ChatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chats
        fields = '__all__'


class OrdersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = '__all__'


class TasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        fields = '__all__'
