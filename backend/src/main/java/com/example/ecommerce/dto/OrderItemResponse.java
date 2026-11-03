package com.example.ecommerce.dto;

import java.math.BigDecimal;

import com.example.ecommerce.entity.OrderItem;

public record OrderItemResponse(
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal purchasePrice,
        BigDecimal subtotal
) {

    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getPurchasePrice(),
                item.getSubtotal()
        );
    }
}