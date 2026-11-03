package com.example.ecommerce.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ProductRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private List<String> messagesFor(ProductRequest request) {
        Set<ConstraintViolation<ProductRequest>> violations = validator.validate(request);
        return violations.stream().map(ConstraintViolation::getMessage).toList();
    }

    @Test
    void validRequest_hasNoViolations() {
        ProductRequest request = new ProductRequest(
                "Mouse", "Nice", new BigDecimal("599.00"), "Electronics", 10, null);

        assertThat(messagesFor(request)).isEmpty();
    }

    @Test
    void blankName_isRejected() {
        ProductRequest request = new ProductRequest(
                "   ", "Nice", new BigDecimal("599.00"), "Electronics", 10, null);

        assertThat(messagesFor(request)).contains("Name is required");
    }

    @Test
    void zeroPrice_isRejected() {
        ProductRequest request = new ProductRequest(
                "Mouse", "Nice", BigDecimal.ZERO, "Electronics", 10, null);

        assertThat(messagesFor(request)).contains("Price must be at least 0.01");
    }

    @Test
    void priceWithTooManyDecimals_isRejected() {
        ProductRequest request = new ProductRequest(
                "Mouse", "Nice", new BigDecimal("10.123"), "Electronics", 10, null);

        assertThat(messagesFor(request)).contains("Price can have at most 8 digits and 2 decimals");
    }

    @Test
    void negativeStock_isRejected() {
        ProductRequest request = new ProductRequest(
                "Mouse", "Nice", new BigDecimal("599.00"), "Electronics", -1, null);

        assertThat(messagesFor(request)).contains("Stock quantity cannot be negative");
    }
}