import pytest

from wallet.factories import CustomObjectFactory, CustomUserFactory
from wallet.scopes_backend import STATIC_SCOPES, DynamicScopesBackend


@pytest.fixture
def backend():
    return DynamicScopesBackend()


@pytest.mark.django_db
class TestDynamicScopesBackend:
    def test_get_all_scopes_includes_all_static_scopes(self, backend):
        scopes = backend.get_all_scopes()
        for key in STATIC_SCOPES:
            assert key in scopes
            assert scopes[key] == STATIC_SCOPES[key]

    def test_get_all_scopes_no_dynamic_scopes_when_no_custom_objects(self, backend):
        scopes = backend.get_all_scopes()
        assert scopes == STATIC_SCOPES

    def test_get_all_scopes_adds_custom_name_scope_per_name_type(self, backend):
        CustomObjectFactory(name_type="employee_id")
        scopes = backend.get_all_scopes()
        assert "custom_name:employee_id" in scopes

    def test_get_all_scopes_description_replaces_underscores_with_spaces(self, backend):
        CustomObjectFactory(name_type="employee_id")
        scopes = backend.get_all_scopes()
        assert scopes["custom_name:employee_id"] == "Access to user's employee id"

    def test_get_all_scopes_deduplicates_same_name_type(self, backend):
        user = CustomUserFactory()
        CustomObjectFactory(user=user, name_type="membership_id")
        CustomObjectFactory(user=user, name_type="membership_id")
        scopes = backend.get_all_scopes()
        custom_keys = [k for k in scopes if k.startswith("custom_name:")]
        assert custom_keys.count("custom_name:membership_id") == 1

    def test_get_all_scopes_multiple_distinct_name_types(self, backend):
        CustomObjectFactory(name_type="employee_id")
        CustomObjectFactory(name_type="student_number")
        scopes = backend.get_all_scopes()
        assert "custom_name:employee_id" in scopes
        assert "custom_name:student_number" in scopes

    def test_get_available_scopes_returns_list(self, backend):
        result = backend.get_available_scopes()
        assert isinstance(result, list)

    def test_get_available_scopes_contains_all_static_keys(self, backend):
        result = backend.get_available_scopes()
        for key in STATIC_SCOPES:
            assert key in result

    def test_get_available_scopes_includes_dynamic_keys(self, backend):
        CustomObjectFactory(name_type="tax_id")
        result = backend.get_available_scopes()
        assert "custom_name:tax_id" in result

    def test_get_default_scopes_returns_openid_only(self, backend):
        assert backend.get_default_scopes() == ["openid"]
