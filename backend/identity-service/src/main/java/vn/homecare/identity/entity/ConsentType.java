package vn.homecare.identity.entity;

/**
 * Purposes a user consents to separately (US-14-001, DD-0018). TERMS and PRIVACY are required to use the platform;
 * CAREGIVER_CODE and PARTNER_SHARING are required to register as staff (US-01-004).
 */
public enum ConsentType {
    TERMS,
    PRIVACY,
    HEALTH_DATA,
    LOCATION,
    CARE_PHOTO,
    MARKETING,
    CAREGIVER_CODE,
    PARTNER_SHARING;

    public boolean isMandatory() {
        return this == TERMS || this == PRIVACY;
    }
}
