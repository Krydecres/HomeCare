package vn.homecare.identity.entity;

import java.util.EnumSet;
import java.util.Set;

/** Realm roles of 13_RBAC (DD-0015). The same names exist as Keycloak realm roles. */
public enum AppRole {
    CUSTOMER,
    ELDER,
    CAREGIVER_PENDING,
    CAREGIVER,
    DISPATCHER,
    ADMIN,
    ACCOUNTANT,
    PARTNER_ORG;

    /** Roles an Admin may give when creating an internal account (US-01-007). */
    public static final Set<AppRole> INTERNAL = EnumSet.of(DISPATCHER, ADMIN, ACCOUNTANT);

    /** Roles only caregiver-service may grant after a partner hospital approves (OQ-037, API-SV04-020). */
    public static final Set<AppRole> GRANTED_BY_PARTNER = EnumSet.of(CAREGIVER, PARTNER_ORG);
}
