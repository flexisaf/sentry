from __future__ import absolute_import

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from social_auth.models import UserSocialAuth

from sentry.api.base import Endpoint
from sentry.api.serializers import serialize


class AccountIdentitiesIndexEndpoint(Endpoint):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        identity_list = list(UserSocialAuth.objects.filter(user=request.user))
        return Response(serialize(identity_list))
