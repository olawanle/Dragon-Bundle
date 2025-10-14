import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductProvider with ChangeNotifier {
  List<Product> _products = [];
  List<Product> _searchResults = [];
  bool _isLoading = false;
  bool _isSearching = false;
  String? _error;
  String? _searchError;
  String? _nextCursor;
  String? _searchCursor;
  bool _hasMoreProducts = true;
  bool _hasMoreSearchResults = true;

  List<Product> get products => _products;
  List<Product> get searchResults => _searchResults;
  bool get isLoading => _isLoading;
  bool get isSearching => _isSearching;
  String? get error => _error;
  String? get searchError => _searchError;
  bool get hasMoreProducts => _hasMoreProducts;
  bool get hasMoreSearchResults => _hasMoreSearchResults;

  Future<void> loadProducts({bool refresh = false}) async {
    if (refresh) {
      _products.clear();
      _nextCursor = null;
      _hasMoreProducts = true;
    }

    if (!_hasMoreProducts && !refresh) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.getProducts(
        cursor: _nextCursor,
        limit: 20,
      );

      if (refresh) {
        _products = response.products;
      } else {
        _products.addAll(response.products);
      }

      _nextCursor = response.cursor;
      _hasMoreProducts = response.hasNextPage;
    } catch (e) {
      _error = ApiService.getErrorMessage(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchProducts(String query, {bool refresh = false}) async {
    if (query.isEmpty) {
      _searchResults.clear();
      _searchCursor = null;
      _hasMoreSearchResults = true;
      notifyListeners();
      return;
    }

    if (refresh) {
      _searchResults.clear();
      _searchCursor = null;
      _hasMoreSearchResults = true;
    }

    if (!_hasMoreSearchResults && !refresh) return;

    _isSearching = true;
    _searchError = null;
    notifyListeners();

    try {
      final response = await ApiService.searchProducts(
        query: query,
        cursor: _searchCursor,
        limit: 20,
      );

      if (refresh) {
        _searchResults = response.products;
      } else {
        _searchResults.addAll(response.products);
      }

      _searchCursor = response.cursor;
      _hasMoreSearchResults = response.hasNextPage;
    } catch (e) {
      _searchError = ApiService.getErrorMessage(e);
    } finally {
      _isSearching = false;
      notifyListeners();
    }
  }

  void clearSearch() {
    _searchResults.clear();
    _searchCursor = null;
    _hasMoreSearchResults = true;
    _searchError = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clearSearchError() {
    _searchError = null;
    notifyListeners();
  }
}

