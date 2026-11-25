package vn.homecare.common.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noMethods;

import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

/**
 * Architecture rules R-02 → R-07 shared by every service (US-15-005). Each service has one {@code ArchitectureTest}:
 *
 * <pre>{@code
 * @AnalyzeClasses(packages = "vn.homecare.identity", importOptions = ImportOption.DoNotIncludeTests.class)
 * class ArchitectureTest {
 *     @ArchTest
 *     static final ArchTests RULES = ArchTests.in(HomecareArchitectureRules.class);
 * }
 * }</pre>
 */
public final class HomecareArchitectureRules {

    private HomecareArchitectureRules() {}

    /** R-03: only the fixed sub-packages (plus the root package for the *Application class). */
    @ArchTest
    public static final ArchRule ONLY_ALLOWED_PACKAGES = classes()
            .should()
            .resideInAnyPackage(
                    "vn.homecare.*",
                    "vn.homecare.*.controller..",
                    "vn.homecare.*.service",
                    "vn.homecare.*.service.impl..",
                    "vn.homecare.*.repository..",
                    "vn.homecare.*.entity..",
                    "vn.homecare.*.dto.request..",
                    "vn.homecare.*.dto.response..",
                    "vn.homecare.*.mapper..",
                    "vn.homecare.*.client..",
                    "vn.homecare.*.event..",
                    "vn.homecare.*.config..",
                    "vn.homecare.*.exception..",
                    "vn.homecare.*.security..",
                    "vn.homecare.*.scheduler..")
            .because("R-03: cấu trúc package cố định");

    /** R-04: controller never talks to a repository. */
    @ArchTest
    public static final ArchRule CONTROLLER_NOT_USE_REPOSITORY = noClasses()
            .that()
            .resideInAPackage("..controller..")
            .should()
            .dependOnClassesThat()
            .resideInAPackage("..repository..")
            .allowEmptyShould(true)
            .because("R-04");

    /** R-06: entities never leave the service layer. */
    @ArchTest
    public static final ArchRule CONTROLLER_NOT_USE_ENTITY = noClasses()
            .that()
            .resideInAPackage("..controller..")
            .should()
            .dependOnClassesThat()
            .resideInAPackage("..entity..")
            .allowEmptyShould(true)
            .because("R-06: Entity không ra khỏi service layer, dùng DTO record");

    /** R-05: @Transactional only on ServiceImpl. */
    @ArchTest
    public static final ArchRule TRANSACTIONAL_ONLY_IN_SERVICE_IMPL = noMethods()
            .that()
            .areDeclaredInClassesThat()
            .resideOutsideOfPackage("..service.impl..")
            .should()
            .beAnnotatedWith(Transactional.class)
            .allowEmptyShould(true)
            .because("R-05");

    /** R-35 / US-15-005: every public endpoint states its permission explicitly. */
    @ArchTest
    public static final ArchRule ENDPOINTS_HAVE_PRE_AUTHORIZE = methods()
            .that()
            .arePublic()
            .and()
            .areDeclaredInClassesThat()
            .areAnnotatedWith(RestController.class)
            .should()
            .beAnnotatedWith(PreAuthorize.class)
            .orShould()
            .beDeclaredInClassesThat()
            .areAnnotatedWith(PreAuthorize.class)
            .allowEmptyShould(true)
            .because("R-35: mọi API phải phân quyền theo 13_RBAC");

    @ArchTest
    public static final ArchRule CONTROLLER_NAMES = classes()
            .that()
            .resideInAPackage("..controller..")
            .and()
            .areTopLevelClasses()
            .should()
            .haveSimpleNameEndingWith("Controller")
            .allowEmptyShould(true);

    @ArchTest
    public static final ArchRule SERVICE_IMPL_NAMES = classes()
            .that()
            .resideInAPackage("..service.impl..")
            .and()
            .areTopLevelClasses()
            .should()
            .haveSimpleNameEndingWith("ServiceImpl")
            .allowEmptyShould(true);

    @ArchTest
    public static final ArchRule SERVICE_INTERFACE_NAMES = classes()
            .that()
            .resideInAPackage("vn.homecare.*.service")
            .should()
            .beInterfaces()
            .andShould()
            .haveSimpleNameEndingWith("Service")
            .allowEmptyShould(true)
            .because("R-05: XxxService là interface, logic ở XxxServiceImpl");

    @ArchTest
    public static final ArchRule REPOSITORY_NAMES = classes()
            .that()
            .resideInAPackage("..repository..")
            .should()
            .haveSimpleNameEndingWith("Repository")
            .allowEmptyShould(true);

    @ArchTest
    public static final ArchRule MAPPER_NAMES = classes()
            .that()
            .resideInAPackage("..mapper..")
            .and()
            .areTopLevelClasses()
            .should()
            .haveSimpleNameEndingWith("Mapper")
            .allowEmptyShould(true);

    /** R-02: forbidden styles. */
    @ArchTest
    public static final ArchRule NO_REACTIVE_OR_GRAPHQL = noClasses()
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage("org.springframework.web.reactive..", "reactor.core..", "org.springframework.graphql..")
            .because("R-02: cấm WebFlux/Reactive, GraphQL");

    /** R-07: a service only depends on itself and homecare-common, never on another service's code. */
    @ArchTest
    public static final ArchRule NO_CROSS_SERVICE_CODE =
            classes().should(notDependOnOtherService()).because("R-07: gọi service khác qua HTTP/RabbitMQ");

    private static ArchCondition<JavaClass> notDependOnOtherService() {
        return new ArchCondition<>("not depend on classes of another HomeCare service") {
            @Override
            public void check(JavaClass item, ConditionEvents events) {
                String own = serviceSegment(item.getPackageName());
                for (Dependency dependency : item.getDirectDependenciesFromSelf()) {
                    String target = serviceSegment(dependency.getTargetClass().getPackageName());
                    if (target != null && !target.equals(own) && !target.equals("common")) {
                        events.add(SimpleConditionEvent.violated(dependency, dependency.getDescription()));
                    }
                }
            }
        };
    }

    private static String serviceSegment(String packageName) {
        if (!packageName.startsWith("vn.homecare.")) {
            return null;
        }
        String rest = packageName.substring("vn.homecare.".length());
        int dot = rest.indexOf('.');
        return dot < 0 ? rest : rest.substring(0, dot);
    }
}
