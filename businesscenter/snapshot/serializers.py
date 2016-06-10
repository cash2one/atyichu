from __future__ import unicode_literals

from rest_framework import serializers

from . import models


class MirrorSerializer(serializers.ModelSerializer):

    is_online = serializers.BooleanField(read_only=True)

    class Meta:
        model = models.Mirror
        fields = ('id', 'title', 'latitude', 'longitude', 'is_locked',
                  'is_online')


class CommentSerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='author', read_only=True)

    class Meta:
        model = models.Comment


class PhotoListSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name='snapshot:photo-detail')
    comment_count = serializers.IntegerField(source='comment_set.count',
                                             read_only=True)

    class Meta:
        model = models.Photo
        fields = ('id', 'url', 'create_date', 'comment_count',
                  'owner', 'title', 'thumb',
                  )


class PhotoDetailSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(source='comment_set', many=True,
                                 read_only=True)

    class Meta:
        model = models.Photo