package vn.homecare.common.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import jakarta.persistence.Entity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.common.event.ProcessedEvent;
import vn.homecare.common.outbox.OutboxEvent;

/** US-15-004: homecare-common contains infrastructure code only, never business entities or endpoints. */
@AnalyzeClasses(packages = "vn.homecare.common", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule ONLY_INFRASTRUCTURE_ENTITIES = classes()
            .that()
            .areAnnotatedWith(Entity.class)
            .should()
            .haveNameMatching(OutboxEvent.class.getName().replace(".", "\\.") + "|"
                    + ProcessedEvent.class.getName().replace(".", "\\."))
            .because("US-15-004: homecare-common không chứa entity nghiệp vụ");

    @ArchTest
    static final ArchRule NO_ENDPOINTS = noClasses()
            .should()
            .beAnnotatedWith(RestController.class)
            .orShould()
            .beAnnotatedWith(Controller.class)
            .because("US-15-004: homecare-common không chứa API nghiệp vụ");

    @ArchTest
    static final ArchRule NO_SERVICE_DEPENDENCY = noClasses()
            .should()
            .dependOnClassesThat(JavaClass.Predicates.resideInAPackage("vn.homecare..")
                    .and(JavaClass.Predicates.resideOutsideOfPackage("vn.homecare.common..")))
            .because("homecare-common không phụ thuộc service nào");
}
