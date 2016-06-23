# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-20 11:15
from __future__ import unicode_literals

from django.db import migrations, models
import utils.utils
import utils.validators


class Migration(migrations.Migration):

    dependencies = [
        ('snapshot', '0020_auto_20160620_1710'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to=utils.utils.UploadPath('snapshot/group', 'title', '', 'owner'), validators=[utils.validators.SizeValidator(2)], verbose_name='Group avatar'),
        ),
        migrations.AlterField(
            model_name='group',
            name='thumb',
            field=models.ImageField(blank=True, null=True, upload_to=utils.utils.UploadPath('snapshot/group/thumbs', 'title', 'thumb', 'owner'), verbose_name='Thumbnail'),
        ),
    ]