package vn.homecare.identity.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.homecare.identity.service.AccountService;
import vn.homecare.identity.service.DataExportService;

/** Background jobs of identity-service: account anonymization (US-14-003) and data exports (US-14-002). */
@Component
public class IdentityJobScheduler {

    private static final Logger log = LoggerFactory.getLogger(IdentityJobScheduler.class);

    private final AccountService accountService;
    private final DataExportService dataExportService;

    public IdentityJobScheduler(AccountService accountService, DataExportService dataExportService) {
        this.accountService = accountService;
        this.dataExportService = dataExportService;
    }

    /** Every night at 02:00 (Viet Nam time). */
    @Scheduled(cron = "${homecare.identity.jobs.anonymize-cron:0 0 2 * * *}", zone = "Asia/Ho_Chi_Minh")
    public void anonymizeDueAccounts() {
        int count = accountService.anonymizeDueAccounts();
        if (count > 0) {
            log.info("Anonymized {} accounts", count);
        }
    }

    @Scheduled(fixedDelayString = "${homecare.identity.jobs.export-delay:PT30S}")
    public void buildDataExports() {
        dataExportService.buildPending();
    }

    @Scheduled(fixedDelayString = "${homecare.identity.jobs.export-expiry-delay:PT1H}")
    public void expireDataExports() {
        dataExportService.expireOld();
    }
}
