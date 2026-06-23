import pytest
from rest_framework.test import APIClient

from wallet.factories import CustomUserFactory


@pytest.fixture
def user(db):
    return CustomUserFactory()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(db):
    user = CustomUserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    client.user = user
    return client
