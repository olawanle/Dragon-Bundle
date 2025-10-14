class Shop {
  final String shopDomain;
  final String? createdAt;

  Shop({
    required this.shopDomain,
    this.createdAt,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      shopDomain: json['shop_domain'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'shop_domain': shopDomain,
      'created_at': createdAt,
    };
  }
}

class AuthResponse {
  final String token;
  final String shop;

  AuthResponse({
    required this.token,
    required this.shop,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'],
      shop: json['shop'],
    );
  }
}

