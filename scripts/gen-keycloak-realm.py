#!/usr/bin/env python3
"""Generate infra/keycloak/homecare-realm.json (US-15-007). Edit THIS script, then re-run it – do not hand-edit the JSON.

Secrets are Keycloak import placeholders (${ENV_VAR}) resolved from infra/.env when Keycloak imports the realm.

Cách chạy:  python scripts/gen-keycloak-realm.py
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "infra" / "keycloak" / "homecare-realm.json"

# 13_RBAC realm roles. MFA (OTP) is mandatory for ADMIN, ACCOUNTANT, DISPATCHER, PARTNER_ORG through the technical
# composite role "mfa_required" (lower-case, so KeycloakRoleConverter never turns it into an authority).
ROLES = [
    ("CUSTOMER", "R01 Khách hàng / người thân", False),
    ("ELDER", "R02 Người cao tuổi (đăng nhập OTP)", False),
    ("CAREGIVER_PENDING", "Nhân viên đang chờ bệnh viện duyệt (US-03-016)", False),
    ("CAREGIVER", "R03/R04 Nhân viên – CHỈ cấp khi bệnh viện đối tác duyệt (OQ-037)", False),
    ("DISPATCHER", "R05 Điều phối viên", True),
    ("ADMIN", "R06 Quản trị", True),
    ("ACCOUNTANT", "R07 Kế toán", True),
    ("PARTNER_ORG", "R10 Bệnh viện / cơ sở đối tác", True),
    ("SYSTEM", "Service account gọi API nội bộ (client credentials)", False),
]

SERVICES = [
    "identity-service", "customer-service", "caregiver-service", "catalog-service", "booking-service",
    "dispatch-service", "care-record-service", "payment-service", "notification-service", "review-service",
    "incident-service", "report-service",
]

API_AUDIENCE = "homecare-api"


def mapper_roles():
    return {
        "name": "realm roles", "protocol": "openid-connect", "protocolMapper": "oidc-usermodel-realm-role-mapper",
        "config": {"claim.name": "roles", "multivalued": "true", "jsonType.label": "String",
                   "access.token.claim": "true", "id.token.claim": "true", "userinfo.token.claim": "true",
                   "introspection.token.claim": "true"},
    }


def mapper_attribute(attr):
    return {
        "name": attr, "protocol": "openid-connect", "protocolMapper": "oidc-usermodel-attribute-mapper",
        "config": {"user.attribute": attr, "claim.name": attr, "jsonType.label": "String",
                   "access.token.claim": "true", "id.token.claim": "true", "userinfo.token.claim": "true",
                   "introspection.token.claim": "true"},
    }


def mapper_audience():
    return {
        "name": "homecare-api audience", "protocol": "openid-connect", "protocolMapper": "oidc-audience-mapper",
        "config": {"included.custom.audience": API_AUDIENCE, "access.token.claim": "true",
                   "id.token.claim": "false", "introspection.token.claim": "true"},
    }


def env_name(service):
    return "KC_SECRET_" + service.upper().replace("-", "_")


bff = {
    "clientId": "homecare-bff",
    "name": "HomeCare web (api-gateway BFF)",
    "description": "Confidential client của api-gateway. Trình duyệt không bao giờ thấy secret hay token (R-08).",
    "enabled": True,
    "protocol": "openid-connect",
    "publicClient": False,
    "clientAuthenticatorType": "client-secret",
    "secret": "${KEYCLOAK_BFF_CLIENT_SECRET}",
    "standardFlowEnabled": True,
    "implicitFlowEnabled": False,
    "directAccessGrantsEnabled": False,
    "serviceAccountsEnabled": False,
    "frontchannelLogout": False,
    "redirectUris": [
        "${HOMECARE_WEB_URL}/login/oauth2/code/keycloak",
        "http://localhost:5173/login/oauth2/code/keycloak",
        "http://localhost:8080/login/oauth2/code/keycloak",
    ],
    "webOrigins": [],
    "attributes": {
        "pkce.code.challenge.method": "S256",
        "post.logout.redirect.uris": "${HOMECARE_WEB_URL}/*",
        "use.refresh.tokens": "true",
    },
    "protocolMappers": [mapper_roles(), mapper_audience(),
                        mapper_attribute("accountId"), mapper_attribute("partnerOrgId"), mapper_attribute("staffType")],
}

service_clients = [{
    "clientId": s,
    "name": f"{s} (service account)",
    "description": "Gọi API nội bộ bằng client credentials (R-07)",
    "enabled": True,
    "protocol": "openid-connect",
    "publicClient": False,
    "clientAuthenticatorType": "client-secret",
    "secret": "${" + env_name(s) + "}",
    "standardFlowEnabled": False,
    "implicitFlowEnabled": False,
    "directAccessGrantsEnabled": False,
    "serviceAccountsEnabled": True,
    "protocolMappers": [mapper_roles(), mapper_audience()],
} for s in SERVICES]

service_account_users = [{
    "username": f"service-account-{s}",
    "enabled": True,
    "serviceAccountClientId": s,
    "realmRoles": ["SYSTEM"],
    # Only identity-service may create users and assign roles (US-15-007, OQ-037).
    **({"clientRoles": {"realm-management": ["manage-users", "view-users", "query-users"]}}
       if s == "identity-service" else {}),
} for s in SERVICES]

# Login users for local development only (sample people from UI-52, fake data). Demo seed data is US-15-009.
DEV_USERS = [
    ("dev.customer", "Minh Tuấn", "Phạm", ["CUSTOMER"], {}),
    ("dev.elder", "Thị Lan", "Nguyễn", ["ELDER"], {}),
    ("dev.caregiver", "Văn Minh", "Trần", ["CUSTOMER", "CAREGIVER"],
     {"partnerOrgId": ["0193f0a2-0000-7000-8000-00000000a001"], "staffType": ["NURSE"]}),
    ("dev.pending", "Thu Hà", "Lê", ["CUSTOMER", "CAREGIVER_PENDING"], {}),
    ("dev.dispatcher", "Điều phối", "Demo", ["DISPATCHER"], {}),
    ("dev.admin", "Quản trị", "Demo", ["ADMIN"], {}),
    ("dev.accountant", "Kế toán", "Demo", ["ACCOUNTANT"], {}),
    ("dev.partner", "Bệnh viện", "Demo", ["PARTNER_ORG"], {"partnerOrgId": ["0193f0a2-0000-7000-8000-00000000a001"]}),
]

dev_users = [{
    "username": username,
    "enabled": True,
    "email": f"{username}@homecare.test",
    "emailVerified": True,
    "firstName": first,
    "lastName": last,
    "attributes": attrs,
    "credentials": [{"type": "password", "value": "${HOMECARE_DEV_USER_PASSWORD}", "temporary": False}],
    "realmRoles": roles,
} for username, first, last, roles, attrs in DEV_USERS]


def attribute(name, display, user_can_view):
    return {
        "name": name,
        "displayName": display,
        "permissions": {"view": ["admin", "user"] if user_can_view else ["admin"], "edit": ["admin"]},
        "multivalued": False,
    }


# Declarative user profile: users can NOT edit anything themselves (Account Console disabled too, see defaultRole);
# partnerOrgId / staffType are read-only for the user, set only by identity-service (US-15-007).
user_profile = {
    "attributes": [
        {"name": "username", "displayName": "Tên đăng nhập",
         "validations": {"length": {"min": 3, "max": 255}, "username-prohibited-characters": {}, "up-username-not-idn-homograph": {}},
         "permissions": {"view": ["admin", "user"], "edit": ["admin"]}, "multivalued": False},
        {"name": "email", "displayName": "Email",
         "validations": {"email": {}, "length": {"max": 255}},
         "permissions": {"view": ["admin", "user"], "edit": ["admin"]}, "multivalued": False},
        {"name": "firstName", "displayName": "Tên",
         "validations": {"length": {"max": 255}, "person-name-prohibited-characters": {}},
         "permissions": {"view": ["admin", "user"], "edit": ["admin"]}, "multivalued": False},
        {"name": "lastName", "displayName": "Họ",
         "validations": {"length": {"max": 255}, "person-name-prohibited-characters": {}},
         "permissions": {"view": ["admin", "user"], "edit": ["admin"]}, "multivalued": False},
        attribute("accountId", "Account ID (identity-service)", False),
        attribute("partnerOrgId", "Bệnh viện đối tác", True),
        attribute("staffType", "Loại nhân viên", True),
    ],
    "groups": [{"name": "user-metadata", "displayHeader": "User metadata",
                "displayDescription": "Attributes, which refer to user metadata"}],
}

realm = {
    "realm": "homecare",
    "displayName": "HomeCare",
    "enabled": True,
    "sslRequired": "external",
    "registrationAllowed": False,          # đăng ký qua identity-service (US-01-001)
    "resetPasswordAllowed": False,         # quên mật khẩu qua identity-service (US-01-003)
    "editUsernameAllowed": False,
    "loginWithEmailAllowed": True,
    "duplicateEmailsAllowed": False,
    "rememberMe": False,
    "internationalizationEnabled": True,
    "supportedLocales": ["vi", "en"],
    "defaultLocale": "vi",
    # Brute-force detection (US-15-007, US-01-008)
    "bruteForceProtected": True,
    "permanentLockout": False,
    "failureFactor": 5,
    "waitIncrementSeconds": 60,
    "maxFailureWaitSeconds": 900,
    "minimumQuickLoginWaitSeconds": 60,
    "quickLoginCheckMilliSeconds": 1000,
    "maxDeltaTimeSeconds": 43200,
    # Token lifetimes: access token ≤ 5 minutes, the BFF refreshes it (US-15-007)
    "accessTokenLifespan": 300,
    "ssoSessionIdleTimeout": 1800,
    "ssoSessionMaxLifespan": 36000,
    "revokeRefreshToken": True,
    "refreshTokenMaxReuse": 0,
    "passwordPolicy": "length(10) and notUsername and notEmail and maxLength(128)",
    "otpPolicyType": "totp",
    "otpPolicyAlgorithm": "HmacSHA1",
    "otpPolicyDigits": 6,
    "otpPolicyPeriod": 30,
    "browserFlow": "homecare browser",
    "roles": {
        "realm": [
            {"name": "mfa_required", "description": "Kỹ thuật: bắt buộc OTP khi đăng nhập (US-15-007)"},
            *[{"name": name, "description": desc,
               **({"composite": True, "composites": {"realm": ["mfa_required"]}} if mfa else {})}
              for name, desc, mfa in ROLES],
        ]
    },
    # Default role = CUSTOMER only. No account-console roles → users cannot edit their profile there.
    "defaultRole": {"name": "default-roles-homecare", "composite": True, "composites": {"realm": ["CUSTOMER"]}},
    "clients": [bff, *service_clients],
    "users": [*service_account_users, *dev_users],
    "authenticatorConfig": [
        {"alias": "homecare-mfa-required-role", "config": {"condUserRole": "mfa_required", "negate": "false"}},
    ],
    "authenticationFlows": [
        {"alias": "homecare browser", "description": "Browser login; OTP bắt buộc cho role nội bộ (US-15-007)",
         "providerId": "basic-flow", "topLevel": True, "builtIn": False,
         "authenticationExecutions": [
             {"authenticator": "auth-cookie", "authenticatorFlow": False, "requirement": "ALTERNATIVE",
              "priority": 10, "userSetupAllowed": False},
             {"authenticatorFlow": True, "requirement": "ALTERNATIVE", "priority": 20,
              "flowAlias": "homecare browser forms", "userSetupAllowed": False},
         ]},
        {"alias": "homecare browser forms", "description": "Username/password + OTP có điều kiện",
         "providerId": "basic-flow", "topLevel": False, "builtIn": False,
         "authenticationExecutions": [
             {"authenticator": "auth-username-password-form", "authenticatorFlow": False,
              "requirement": "REQUIRED", "priority": 10, "userSetupAllowed": False},
             {"authenticatorFlow": True, "requirement": "CONDITIONAL", "priority": 20,
              "flowAlias": "homecare internal staff otp", "userSetupAllowed": False},
         ]},
        {"alias": "homecare internal staff otp", "description": "ADMIN, ACCOUNTANT, DISPATCHER, PARTNER_ORG",
         "providerId": "basic-flow", "topLevel": False, "builtIn": False,
         "authenticationExecutions": [
             {"authenticator": "conditional-user-role", "authenticatorConfig": "homecare-mfa-required-role",
              "authenticatorFlow": False, "requirement": "REQUIRED", "priority": 10, "userSetupAllowed": False},
             {"authenticator": "auth-otp-form", "authenticatorFlow": False, "requirement": "REQUIRED",
              "priority": 20, "userSetupAllowed": False},
         ]},
    ],
    "components": {
        "org.keycloak.userprofile.UserProfileProvider": [{
            "providerId": "declarative-user-profile",
            "subComponents": {},
            "config": {"kc.user.profile.config": [json.dumps(user_profile, ensure_ascii=False)]},
        }]
    },
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(realm, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {OUT}")
