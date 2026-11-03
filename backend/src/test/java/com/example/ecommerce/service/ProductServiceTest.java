package com.example.ecommerce.service;

import com.example.ecommerce.dto.ProductRequest;
import com.example.ecommerce.dto.ProductResponse;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Wireless Mouse");
        product.setDescription("Silent clicks");
        product.setPrice(new BigDecimal("599.00"));
        product.setCategory("Electronics");
        product.setStockQuantity(40);
        product.setImageUrl("https://placehold.co/400x300");
        return product;
    }

    private ProductRequest sampleRequest() {
        return new ProductRequest(
                "  Keyboard  ", "Backlit", new BigDecimal("2499.00"),
                " Electronics ", 25, "https://placehold.co/400x300");
    }

    @Test
    void getProductById_returnsProduct_whenItExists() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct()));

        ProductResponse response = productService.getProductById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("Wireless Mouse");
        assertThat(response.price()).isEqualByComparingTo("599.00");
    }

    @Test
    void getProductById_throwsNotFound_whenProductIsMissing() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void createProduct_trimsTextAndSavesProduct() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        ProductResponse response = productService.createProduct(sampleRequest());

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.name()).isEqualTo("Keyboard");
        assertThat(response.category()).isEqualTo("Electronics");
        assertThat(response.stockQuantity()).isEqualTo(25);
    }

    @Test
    void updateProduct_throwsNotFound_andDoesNotSave() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.updateProduct(999L, sampleRequest()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void deleteProduct_throwsNotFound_whenProductIsMissing() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteProduct(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(productRepository, never()).delete(any(Product.class));
    }

    @Test
    void deleteProduct_throwsBadRequest_whenProductIsUsedInAnOrder() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct()));
        doThrow(new DataIntegrityViolationException("foreign key"))
                .when(productRepository).flush();

        assertThatThrownBy(() -> productService.deleteProduct(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be deleted");
    }

    @Test
    void searchProducts_returnsAllProducts_whenNameIsBlank() {
        when(productRepository.findAll()).thenReturn(List.of(sampleProduct()));

        List<ProductResponse> result = productService.searchProducts("   ");

        assertThat(result).hasSize(1);
        verify(productRepository, never()).findByNameContainingIgnoreCase(anyString());
    }

    @Test
    void searchProducts_usesTrimmedSearchText() {
        when(productRepository.findByNameContainingIgnoreCase("mouse"))
                .thenReturn(List.of(sampleProduct()));

        List<ProductResponse> result = productService.searchProducts("  mouse ");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Wireless Mouse");
    }
}