# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-08-03 12:09
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('snapshot', '0037_auto_20160801_1620'),
    ]

    operations = [
        migrations.CreateModel(
            name='PhotoStamp',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('confidence', models.DecimalField(db_index=True, decimal_places=15, max_digits=18, verbose_name='Confidence')),
                ('photo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='snapshot.Photo', verbose_name='Photo')),
            ],
            options={
                'ordering': ('confidence', 'pk'),
                'verbose_name': 'Photo stamp',
                'verbose_name_plural': 'Photo stamps',
            },
        ),
        migrations.CreateModel(
            name='Stamp',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(db_index=True, max_length=255, verbose_name='Title')),
            ],
            options={
                'ordering': ('title',),
                'verbose_name': 'Stamp',
                'verbose_name_plural': 'Stamp',
            },
        ),
        migrations.AddField(
            model_name='photostamp',
            name='stamp',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='snapshot.Stamp', verbose_name='Stamp'),
        ),
        migrations.AddField(
            model_name='photo',
            name='stamps',
            field=models.ManyToManyField(blank=True, null=True, through='snapshot.PhotoStamp', to='snapshot.Stamp'),
        ),
    ]
