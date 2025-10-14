import 'package:flutter/foundation.dart';
import '../models/bundle.dart';
import '../services/api_service.dart';

class BundleProvider with ChangeNotifier {
  List<Bundle> _bundles = [];
  Bundle? _currentBundle;
  bool _isLoading = false;
  bool _isCreating = false;
  bool _isUpdating = false;
  bool _isDeleting = false;
  String? _error;

  List<Bundle> get bundles => _bundles;
  Bundle? get currentBundle => _currentBundle;
  bool get isLoading => _isLoading;
  bool get isCreating => _isCreating;
  bool get isUpdating => _isUpdating;
  bool get isDeleting => _isDeleting;
  String? get error => _error;

  Future<void> loadBundles() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _bundles = await ApiService.getBundles();
    } catch (e) {
      _error = ApiService.getErrorMessage(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadBundle(int bundleId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentBundle = await ApiService.getBundle(bundleId);
    } catch (e) {
      _error = ApiService.getErrorMessage(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createBundle(CreateBundleRequest bundleRequest) async {
    _isCreating = true;
    _error = null;
    notifyListeners();

    try {
      final newBundle = await ApiService.createBundle(bundleRequest);
      _bundles.insert(0, newBundle);
      notifyListeners();
      return true;
    } catch (e) {
      _error = ApiService.getErrorMessage(e);
      notifyListeners();
      return false;
    } finally {
      _isCreating = false;
    }
  }

  Future<bool> updateBundle(int bundleId, CreateBundleRequest bundleRequest) async {
    _isUpdating = true;
    _error = null;
    notifyListeners();

    try {
      final updatedBundle = await ApiService.updateBundle(bundleId, bundleRequest);
      
      // Update in bundles list
      final index = _bundles.indexWhere((b) => b.id == bundleId);
      if (index != -1) {
        _bundles[index] = updatedBundle;
      }
      
      // Update current bundle if it's the same
      if (_currentBundle?.id == bundleId) {
        _currentBundle = updatedBundle;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _error = ApiService.getErrorMessage(e);
      notifyListeners();
      return false;
    } finally {
      _isUpdating = false;
    }
  }

  Future<bool> deleteBundle(int bundleId) async {
    _isDeleting = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.deleteBundle(bundleId);
      
      // Remove from bundles list
      _bundles.removeWhere((b) => b.id == bundleId);
      
      // Clear current bundle if it's the same
      if (_currentBundle?.id == bundleId) {
        _currentBundle = null;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _error = ApiService.getErrorMessage(e);
      notifyListeners();
      return false;
    } finally {
      _isDeleting = false;
    }
  }

  Future<String?> createCheckout(int bundleId) async {
    try {
      final checkoutResponse = await ApiService.createCheckout(bundleId);
      return checkoutResponse.checkoutUrl;
    } catch (e) {
      _error = ApiService.getErrorMessage(e);
      notifyListeners();
      return null;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clearCurrentBundle() {
    _currentBundle = null;
    notifyListeners();
  }
}

