package com.example.ecommerce.service;

import com.example.ecommerce.dto.OrderResponse;
import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    private static final String CART_ID = "11111111-1111-4111-8111-111111111111";

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private Product product(Long id, String name, String price, int stock) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setPrice(new BigDecimal(price));
        product.setCategory("Test");
        product.setStockQuantity(stock);
        return product;
    }

    @Test
    void placeOrder_throwsBadRequest_whenCartIdIsNotAValidUuid() {
        assertThatThrownBy(() -> orderService.placeOrder("abc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("UUID");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void placeOrder_throwsBadRequest_whenCartIsEmpty() {
        when(cartItemRepository.findProductIdsByCartId(CART_ID)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.placeOrder(CART_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("empty");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void placeOrder_savesNothingAndKeepsCart_whenStockIsInsufficient() {
        Product mouse = product(1L, "Wireless Mouse", "599.00", 40);
        Product keyboard = product(2L, "Keyboard", "2499.00", 25);
        Cart cart = new Cart(CART_ID);

        when(cartItemRepository.findProductIdsByCartId(CART_ID)).thenReturn(List.of(1L, 2L));
        when(cartItemRepository.findByCart_IdOrderByIdAsc(CART_ID)).thenReturn(List.of(
                new CartItem(cart, mouse, 2),
                new CartItem(cart, keyboard, 30)));

        assertThatThrownBy(() -> orderService.placeOrder(CART_ID))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Keyboard");

        // No order is saved and the cart is not cleared.
        // In the real application the transaction is rolled back, so no stock row changes either.
        verify(orderRepository, never()).save(any(Order.class));
        verify(cartItemRepository, never()).deleteByCart_Id(anyString());
    }

    @Test
    void placeOrder_reducesStock_usesDatabasePrices_andClearsCart() {
        Product mouse = product(1L, "Wireless Mouse", "599.00", 40);
        Product keyboard = product(2L, "Keyboard", "2499.00", 25);
        Cart cart = new Cart(CART_ID);

        when(cartItemRepository.findProductIdsByCartId(CART_ID)).thenReturn(List.of(1L, 2L));
        when(cartItemRepository.findByCart_IdOrderByIdAsc(CART_ID)).thenReturn(List.of(
                new CartItem(cart, mouse, 2),
                new CartItem(cart, keyboard, 1)));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.placeOrder(CART_ID);

        assertThat(response.status()).isEqualTo("PLACED");
        assertThat(response.items()).hasSize(2);
        assertThat(response.totalAmount()).isEqualByComparingTo("3697.00");
        assertThat(response.items().get(0).purchasePrice()).isEqualByComparingTo("599.00");
        assertThat(response.items().get(0).subtotal()).isEqualByComparingTo("1198.00");

        assertThat(mouse.getStockQuantity()).isEqualTo(38);
        assertThat(keyboard.getStockQuantity()).isEqualTo(24);

        verify(productRepository).findByIdInOrderByIdAsc(anyCollection());
        verify(cartItemRepository).deleteByCart_Id(CART_ID);
    }
}