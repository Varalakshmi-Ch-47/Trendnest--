package com.example.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.OrderResponse;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse placeOrder(String cartId) {
        String id = CartService.normalizeCartId(cartId);

        List<Long> productIds = cartItemRepository.findProductIdsByCartId(id);
        if (productIds.isEmpty()) {
            throw new BadRequestException("Cart is empty. Add items before placing an order");
        }

        // Lock the product rows first, so the stock we read below cannot change under us.
        productRepository.findByIdInOrderByIdAsc(productIds);

        List<CartItem> cartItems = cartItemRepository.findByCart_IdOrderByIdAsc(id);

        Order order = new Order(id);
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            int quantity = cartItem.getQuantity();

            if (quantity > product.getStockQuantity()) {
                throw new InsufficientStockException(
                        "Only " + product.getStockQuantity() + " unit(s) of '"
                                + product.getName() + "' are available");
            }

            product.setStockQuantity(product.getStockQuantity() - quantity);

            OrderItem orderItem = new OrderItem(order, product, quantity, product.getPrice());
            order.addItem(orderItem);
            total = total.add(orderItem.getSubtotal());
        }

        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);

        cartItemRepository.deleteByCart_Id(id);

        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDescIdDesc().stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrderHistory(String cartId) {
        String id = CartService.normalizeCartId(cartId);
        return orderRepository.findByCartIdOrderByOrderDateDescIdDesc(id).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return OrderResponse.from(order);
    }
}