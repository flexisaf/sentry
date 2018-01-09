from __future__ import absolute_import

import pytest

from django.core.urlresolvers import reverse

from social_auth.models import UserSocialAuth
from sentry.testutils import APITestCase


class AccountIdentityDetailsEndpointTest(APITestCase):
    #  Throws backend not found
    @pytest.mark.skip
    def test_can_disconnect(self):
        UserSocialAuth.create_social_auth(self.user, '1234', 'github')
        self.login_as(self.user)
        url = reverse('sentry-api-0-account-settings-identity-details', kwargs={
            'identity_id': 1
        })
        response = self.client.delete(url)
        assert response.status_code == 204

    def test_disconnect_id_not_found(self):
        UserSocialAuth.create_social_auth(self.user, '1234', 'github')
        self.login_as(self.user)
        url = reverse('sentry-api-0-account-settings-identity-details', kwargs={
            'identity_id': 1234
        })
        response = self.client.delete(url)
        assert response.status_code == 404
