class Bundle {
  final int? id;
  final String shopDomain;
  final String title;
  final String? description;
  final String? coverImageUrl;
  final String discountType;
  final double discountValue;
  final List<BundleItem> items;
  final String? createdAt;
  final String? updatedAt;

  Bundle({
    this.id,
    required this.shopDomain,
    required this.title,
    this.description,
    this.coverImageUrl,
    required this.discountType,
    required this.discountValue,
    required this.items,
    this.createdAt,
    this.updatedAt,
  });

  factory Bundle.fromJson(Map<String, dynamic> json) {
    return Bundle(
      id: json['id'],
      shopDomain: json['shop_domain'],
      title: json['title'],
      description: json['description'],
      coverImageUrl: json['cover_image_url'],
      discountType: json['discount_type'],
      discountValue: (json['discount_value'] as num).toDouble(),
      items: (json['items'] as List)
          .map((item) => BundleItem.fromJson(item))
          .toList(),
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shop_domain': shopDomain,
      'title': title,
      'description': description,
      'cover_image_url': coverImageUrl,
      'discount_type': discountType,
      'discount_value': discountValue,
      'items': items.map((item) => item.toJson()).toList(),
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  double get totalPrice {
    return items.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  double get discountedPrice {
    if (discountType == 'percentage') {
      return totalPrice * (1 - discountValue / 100);
    } else {
      return (totalPrice - discountValue).clamp(0.0, double.infinity);
    }
  }

  double get savings {
    return totalPrice - discountedPrice;
  }
}

class BundleItem {
  final String productId;
  final String variantId;
  final int quantity;
  final String title;
  final String? variantTitle;
  final String price;
  final String? imageUrl;

  BundleItem({
    required this.productId,
    required this.variantId,
    required this.quantity,
    required this.title,
    this.variantTitle,
    required this.price,
    this.imageUrl,
  });

  factory BundleItem.fromJson(Map<String, dynamic> json) {
    return BundleItem(
      productId: json['product_id'],
      variantId: json['variant_id'],
      quantity: json['quantity'],
      title: json['title'],
      variantTitle: json['variant_title'],
      price: json['price'],
      imageUrl: json['image_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'variant_id': variantId,
      'quantity': quantity,
      'title': title,
      'variant_title': variantTitle,
      'price': price,
      'image_url': imageUrl,
    };
  }

  double get priceAsDouble {
    return double.tryParse(price) ?? 0.0;
  }

  double get totalPrice {
    return priceAsDouble * quantity;
  }
}

class CreateBundleRequest {
  final String title;
  final String? description;
  final String? coverImageUrl;
  final String discountType;
  final double discountValue;
  final List<BundleItem> items;

  CreateBundleRequest({
    required this.title,
    this.description,
    this.coverImageUrl,
    required this.discountType,
    required this.discountValue,
    required this.items,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'cover_image_url': coverImageUrl,
      'discount_type': discountType,
      'discount_value': discountValue,
      'items': items.map((item) => item.toJson()).toList(),
    };
  }
}

class CheckoutResponse {
  final String checkoutId;
  final String checkoutUrl;
  final List<CheckoutLineItem> lineItems;

  CheckoutResponse({
    required this.checkoutId,
    required this.checkoutUrl,
    required this.lineItems,
  });

  factory CheckoutResponse.fromJson(Map<String, dynamic> json) {
    return CheckoutResponse(
      checkoutId: json['checkout_id'],
      checkoutUrl: json['checkout_url'],
      lineItems: (json['line_items'] as List)
          .map((item) => CheckoutLineItem.fromJson(item))
          .toList(),
    );
  }
}

class CheckoutLineItem {
  final String id;
  final String title;
  final int quantity;
  final CheckoutVariant variant;

  CheckoutLineItem({
    required this.id,
    required this.title,
    required this.quantity,
    required this.variant,
  });

  factory CheckoutLineItem.fromJson(Map<String, dynamic> json) {
    return CheckoutLineItem(
      id: json['id'],
      title: json['title'],
      quantity: json['quantity'],
      variant: CheckoutVariant.fromJson(json['variant']),
    );
  }
}

class CheckoutVariant {
  final String id;
  final String title;
  final String price;

  CheckoutVariant({
    required this.id,
    required this.title,
    required this.price,
  });

  factory CheckoutVariant.fromJson(Map<String, dynamic> json) {
    return CheckoutVariant(
      id: json['id'],
      title: json['title'],
      price: json['price'],
    );
  }
}

