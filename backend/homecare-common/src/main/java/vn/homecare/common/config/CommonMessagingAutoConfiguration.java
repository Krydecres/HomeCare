package vn.homecare.common.config;

import jakarta.persistence.EntityManagerFactory;
import java.time.Clock;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.json.JsonMapper;
import vn.homecare.common.audit.AuditEventRecorder;
import vn.homecare.common.event.IdempotentConsumer;
import vn.homecare.common.event.ProcessedEvent;
import vn.homecare.common.event.ProcessedEventRepository;
import vn.homecare.common.outbox.OutboxEvent;
import vn.homecare.common.outbox.OutboxEventRecorder;
import vn.homecare.common.outbox.OutboxEventRepository;
import vn.homecare.common.outbox.OutboxPublisher;

/**
 * Transactional Outbox + idempotent consumer for every service with a database (R-09, US-15-004). Registers the
 * entities/repositories of {@code outbox_events} and {@code processed_events} (tables created by each service's Flyway
 * migration in its own schema) and declares the topic exchange {@code homecare.events}.
 */
// Must run before JPA so that the outbox/processed_events packages are registered for entity & repository scanning.
@AutoConfiguration(
        beforeName = {
            "org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration",
            "org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration"
        })
@ConditionalOnClass({RabbitTemplate.class, EntityManagerFactory.class})
@AutoConfigurationPackage(basePackageClasses = {OutboxEvent.class, ProcessedEvent.class})
@EnableScheduling
public class CommonMessagingAutoConfiguration {

    @Bean
    public TopicExchange homecareEventsExchange() {
        return new TopicExchange(OutboxPublisher.EXCHANGE, true, false);
    }

    @Bean
    @ConditionalOnMissingBean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public OutboxEventRecorder outboxEventRecorder(
            OutboxEventRepository outboxEventRepository,
            JsonMapper jsonMapper,
            Clock clock,
            @Value("${spring.application.name}") String producer) {
        return new OutboxEventRecorder(outboxEventRepository, jsonMapper, clock, producer);
    }

    @Bean
    public OutboxPublisher outboxPublisher(
            OutboxEventRepository outboxEventRepository,
            RabbitTemplate rabbitTemplate,
            TransactionTemplate transactionTemplate,
            Clock clock) {
        return new OutboxPublisher(outboxEventRepository, rabbitTemplate, transactionTemplate, clock);
    }

    /** Needs Spring Security (every business service has it). */
    @Bean
    @ConditionalOnClass(
            name = "org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken")
    public AuditEventRecorder auditEventRecorder(OutboxEventRecorder outboxEventRecorder) {
        return new AuditEventRecorder(outboxEventRecorder);
    }

    @Bean
    public IdempotentConsumer idempotentConsumer(
            ProcessedEventRepository processedEventRepository, TransactionTemplate transactionTemplate, Clock clock) {
        return new IdempotentConsumer(processedEventRepository, transactionTemplate, clock);
    }
}
