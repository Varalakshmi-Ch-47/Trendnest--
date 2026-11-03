package com.example.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.ecommerce.entity.Order;

public record OrderResponse(
        Long id,
        LocalDateTime orderDate,
        String status,
        BigDecimal totalAmount,
        List<OrderItemResponse> items
) {

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderItemResponse::from)
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getOrderDate(),
                order.getStatus().name(),
                order.getTotalAmount(),
                items
        );
    }
}
