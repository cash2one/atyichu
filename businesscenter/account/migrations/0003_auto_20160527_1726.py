# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-05-27 09:26
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_auto_20160527_0754'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='visitor',
            name='user',
        ),
        migrations.DeleteModel(
            name='Visitor',
        ),
    ]
