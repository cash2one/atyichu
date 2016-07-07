from __future__ import unicode_literals

from rest_framework import serializers

from . import models
from visitor.serializers import WeixinSerializer, VisitorShortSerializer
from django.template.defaultfilters import timesince, truncatechars_html


class MirrorSerializer(serializers.ModelSerializer):

    is_online = serializers.BooleanField(read_only=True)

    class Meta:
        model = models.Mirror
        fields = ('id', 'title', 'latitude', 'longitude', 'is_locked',
                  'is_online', 'last_login')


class CommentSerializer(serializers.ModelSerializer):

    author_data = WeixinSerializer(source='author', read_only=True)

    class Meta:
        model = models.Comment


class PhotoOriginalSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Photo
        fields = ('id', 'photo', 'thumb', 'crop', 'visitor', 'like')


class PhotoListSerializer(serializers.ModelSerializer):
    comment_count = serializers.IntegerField(source='comment_set.count',
                                             read_only=True)
    owner = VisitorShortSerializer(source='visitor', read_only=True)
    descr = serializers.SerializerMethodField(read_only=True)
    origin = PhotoOriginalSerializer(source='original', read_only=True)

    def get_descr(self, obj):
        return truncatechars_html(obj.description, 150)

    class Meta:
        model = models.Photo
        fields = ('id', 'create_date', 'comment_count', 'visitor', 'title',
                  'thumb', 'group',
                  'owner', 'descr', 'like', 'creator',
                  'origin', 'original')


class PhotoDetailSerializer(PhotoListSerializer):
    comments = CommentSerializer(source='comment_set', many=True,
                                 read_only=True)
    owner_thumb = serializers.ImageField(source='visitor.thumb',
                                         read_only=True)

    class Meta:
        model = models.Photo
        read_only_fields = ('thumb', 'crop', 'cover')


class PhotoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Photo
        fields = ('id', 'crop', 'thumb')
# Group serializers started


class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Tag


class MemberSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source='visitor', read_only=True)
    thumb = serializers.ImageField(source='visitor.thumb', read_only=True)

    class Meta:
        model = models.Member
        extra_kwargs = {'group': {'write_only': True}}


class GroupSerializer(serializers.ModelSerializer):
    photo_count = serializers.IntegerField(source='photo_set.count',
                                           read_only=True)

    activity = serializers.SerializerMethodField(read_only=True)
    owner_name = serializers.CharField(source='owner', read_only=True)
    thumb = serializers.SerializerMethodField(read_only=True)

    def get_activity(self, obj):
        return timesince(obj.modify_date)

    def get_thumb(self, obj):
        photo = obj.photo_set.first()
        if photo and photo.cover.name:
            request = self.context.get('request', None)
            url = photo.cover.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return

    class Meta:
        model = models.Group


class GroupListSerializer(GroupSerializer):

    overview = serializers.SerializerMethodField(read_only=True)

    def get_overview(self, obj):
        qs = obj.photo_set.all()[1:4]
        serializer = PhotoSimpleSerializer(instance=qs, many=True)
        return serializer.data

    class Meta:
        model = models.Group


class GroupDetailSerializer(GroupSerializer):

    members = MemberSerializer(source='member_set', many=True, read_only=True)
    tags = TagSerializer(source='tag_set', many=True, read_only=True)

    class Meta:
        model = models.Group


class GroupShortSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Group
        fields = ('id', 'title')
