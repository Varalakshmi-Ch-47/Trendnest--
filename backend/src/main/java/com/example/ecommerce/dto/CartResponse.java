package com.example.ecommerce.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        String cartId,
        List<CartItemResponse> items,
        int totalQuantity,
        BigDecimal totalAmount
) {
}