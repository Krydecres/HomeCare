package vn.homecare.gateway;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.junit.ArchTests;
import vn.homecare.common.architecture.HomecareArchitectureRules;

/** R-02 → R-07 checked on every build (US-15-005). */
@AnalyzeClasses(packages = "vn.homecare.gateway", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchTests RULES = ArchTests.in(HomecareArchitectureRules.class);
}
