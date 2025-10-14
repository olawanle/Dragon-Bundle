import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/product.dart';
import '../models/bundle.dart';
import '../models/shop.dart';

class ApiService {
  static const String _baseUrl = 'http://localhost:3000/api';
  static const FlutterSecureStorage _storage = FlutterSecureStorage();
  static const String _tokenKey = 'auth_token';
  static const String _shopKey = 'shop_domain';

  static Future<String?> _getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  static Future<String?> _getShopDomain() async {
    return await _storage.read(key: _shopKey);
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Shop Authentication
  static Future<String> getInstallUrl(String shopDomain) async {
    return '$_baseUrl/shop/install?shop=$shopDomain';
  }

  static Future<void> saveAuthData(String token, String shopDomain) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _shopKey, value: shopDomain);
  }

  static Future<void> clearAuthData() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _shopKey);
  }

  static Future<bool> isAuthenticated() async {
    final token = await _getToken();
    final shop = await _getShopDomain();
    return token != null && shop != null;
  }

  // Products API
  static Future<ProductsResponse> getProducts({
    String? cursor,
    int limit = 20,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{
      'limit': limit.toString(),
      if (cursor != null) 'cursor': cursor,
    };

    final uri = Uri.parse('$_baseUrl/products').replace(
      queryParameters: queryParams,
    );

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      return ProductsResponse.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load products: ${response.statusCode}');
    }
  }

  static Future<ProductsResponse> searchProducts({
    required String query,
    String? cursor,
    int limit = 20,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{
      'q': query,
      'limit': limit.toString(),
      if (cursor != null) 'cursor': cursor,
    };

    final uri = Uri.parse('$_baseUrl/products/search').replace(
      queryParameters: queryParams,
    );

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      return ProductsResponse.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to search products: ${response.statusCode}');
    }
  }

  // Bundles API
  static Future<List<Bundle>> getBundles() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$_baseUrl/bundles'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> jsonList = json.decode(response.body);
      return jsonList.map((json) => Bundle.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load bundles: ${response.statusCode}');
    }
  }

  static Future<Bundle> getBundle(int bundleId) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$_baseUrl/bundles/$bundleId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return Bundle.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load bundle: ${response.statusCode}');
    }
  }

  static Future<Bundle> createBundle(CreateBundleRequest bundle) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$_baseUrl/bundles'),
      headers: headers,
      body: json.encode(bundle.toJson()),
    );

    if (response.statusCode == 201) {
      return Bundle.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create bundle: ${response.statusCode}');
    }
  }

  static Future<Bundle> updateBundle(int bundleId, CreateBundleRequest bundle) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$_baseUrl/bundles/$bundleId'),
      headers: headers,
      body: json.encode(bundle.toJson()),
    );

    if (response.statusCode == 200) {
      return Bundle.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to update bundle: ${response.statusCode}');
    }
  }

  static Future<void> deleteBundle(int bundleId) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$_baseUrl/bundles/$bundleId'),
      headers: headers,
    );

    if (response.statusCode != 204) {
      throw Exception('Failed to delete bundle: ${response.statusCode}');
    }
  }

  // Checkout API
  static Future<CheckoutResponse> createCheckout(int bundleId) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$_baseUrl/checkout/create'),
      headers: headers,
      body: json.encode({'bundle_id': bundleId}),
    );

    if (response.statusCode == 200) {
      return CheckoutResponse.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create checkout: ${response.statusCode}');
    }
  }

  // Error handling
  static String getErrorMessage(dynamic error) {
    if (error is Exception) {
      return error.toString().replaceFirst('Exception: ', '');
    }
    return 'An unexpected error occurred';
  }
}

