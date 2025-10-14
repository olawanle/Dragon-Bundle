import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  String? _shopDomain;
  String? _token;

  bool get isAuthenticated => _isAuthenticated;
  String? get shopDomain => _shopDomain;
  String? get token => _token;

  Future<void> checkAuthStatus() async {
    _isAuthenticated = await ApiService.isAuthenticated();
    if (_isAuthenticated) {
      _shopDomain = await ApiService._getShopDomain();
      _token = await ApiService._getToken();
    }
    notifyListeners();
  }

  Future<void> login(String token, String shopDomain) async {
    await ApiService.saveAuthData(token, shopDomain);
    _isAuthenticated = true;
    _shopDomain = shopDomain;
    _token = token;
    notifyListeners();
  }

  Future<void> logout() async {
    await ApiService.clearAuthData();
    _isAuthenticated = false;
    _shopDomain = null;
    _token = null;
    notifyListeners();
  }

  String getInstallUrl(String shopDomain) {
    return ApiService.getInstallUrl(shopDomain);
  }
}

