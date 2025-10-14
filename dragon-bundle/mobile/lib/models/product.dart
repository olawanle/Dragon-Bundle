class Product {
  final String id;
  final String title;
  final String? description;
  final List<ProductImage> images;
  final List<ProductVariant> variants;

  Product({
    required this.id,
    required this.title,
    this.description,
    required this.images,
    required this.variants,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      images: (json['images'] as List)
          .map((image) => ProductImage.fromJson(image))
          .toList(),
      variants: (json['variants'] as List)
          .map((variant) => ProductVariant.fromJson(variant))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'images': images.map((image) => image.toJson()).toList(),
      'variants': variants.map((variant) => variant.toJson()).toList(),
    };
  }
}

class ProductImage {
  final String url;
  final String? altText;

  ProductImage({
    required this.url,
    this.altText,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      url: json['url'],
      altText: json['altText'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'altText': altText,
    };
  }
}

class ProductVariant {
  final String id;
  final String title;
  final String price;
  final bool availableForSale;
  final int? inventoryQuantity;
  final List<SelectedOption> selectedOptions;

  ProductVariant({
    required this.id,
    required this.title,
    required this.price,
    required this.availableForSale,
    this.inventoryQuantity,
    required this.selectedOptions,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'],
      title: json['title'],
      price: json['price'],
      availableForSale: json['availableForSale'],
      inventoryQuantity: json['inventoryQuantity'],
      selectedOptions: (json['selectedOptions'] as List)
          .map((option) => SelectedOption.fromJson(option))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'price': price,
      'availableForSale': availableForSale,
      'inventoryQuantity': inventoryQuantity,
      'selectedOptions': selectedOptions.map((option) => option.toJson()).toList(),
    };
  }

  double get priceAsDouble {
    return double.tryParse(price) ?? 0.0;
  }
}

class SelectedOption {
  final String name;
  final String value;

  SelectedOption({
    required this.name,
    required this.value,
  });

  factory SelectedOption.fromJson(Map<String, dynamic> json) {
    return SelectedOption(
      name: json['name'],
      value: json['value'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'value': value,
    };
  }
}

class ProductsResponse {
  final List<Product> products;
  final bool hasNextPage;
  final String? cursor;

  ProductsResponse({
    required this.products,
    required this.hasNextPage,
    this.cursor,
  });

  factory ProductsResponse.fromJson(Map<String, dynamic> json) {
    return ProductsResponse(
      products: (json['products'] as List)
          .map((product) => Product.fromJson(product))
          .toList(),
      hasNextPage: json['hasNextPage'],
      cursor: json['cursor'],
    );
  }
}

