import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/bundle_provider.dart';
import '../models/bundle.dart';

class BundleBuilderScreen extends StatefulWidget {
  const BundleBuilderScreen({super.key});

  @override
  State<BundleBuilderScreen> createState() => _BundleBuilderScreenState();
}

class _BundleBuilderScreenState extends State<BundleBuilderScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _discountController = TextEditingController();
  
  String _discountType = 'percentage';
  List<BundleItem> _bundleItems = [];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _discountController.dispose();
    super.dispose();
  }

  Future<void> _saveBundle() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a bundle title')),
      );
      return;
    }

    if (_bundleItems.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bundle must have at least 2 items')),
      );
      return;
    }

    final discountValue = double.tryParse(_discountController.text);
    if (discountValue == null || discountValue < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid discount value')),
      );
      return;
    }

    final bundleRequest = CreateBundleRequest(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim().isEmpty 
          ? null 
          : _descriptionController.text.trim(),
      discountType: _discountType,
      discountValue: discountValue,
      items: _bundleItems,
    );

    final bundleProvider = Provider.of<BundleProvider>(context, listen: false);
    final success = await bundleProvider.createBundle(bundleRequest);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bundle created successfully!'),
          backgroundColor: Color(0xFF38E07B),
        ),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bundle Builder'),
        actions: [
          TextButton(
            onPressed: _saveBundle,
            child: const Text(
              'Save',
              style: TextStyle(
                color: Color(0xFF38E07B),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bundle Title
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Bundle Title',
                hintText: 'Enter bundle name',
                border: OutlineInputBorder(),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Bundle Description
            TextField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description (Optional)',
                hintText: 'Describe your bundle',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            
            const SizedBox(height: 24),
            
            // Bundle Items
            const Text(
              'Bundle Items',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: 8),
            
            if (_bundleItems.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.add_shopping_cart,
                      size: 48,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'No items added yet',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Go to Products screen to add items to your bundle',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              )
            else
              ..._bundleItems.map((item) => Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF38E07B),
                    child: Text(
                      item.quantity.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(item.title),
                  subtitle: Text(item.variantTitle ?? 'Default'),
                  trailing: Text(
                    '\$${item.totalPrice.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF38E07B),
                    ),
                  ),
                ),
              )),
            
            const SizedBox(height: 24),
            
            // Discount Settings
            const Text(
              'Discount Settings',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: 16),
            
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _discountType,
                    decoration: const InputDecoration(
                      labelText: 'Discount Type',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'percentage',
                        child: Text('Percentage'),
                      ),
                      DropdownMenuItem(
                        value: 'fixed',
                        child: Text('Fixed Amount'),
                      ),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _discountType = value!;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextField(
                    controller: _discountController,
                    decoration: InputDecoration(
                      labelText: _discountType == 'percentage' ? 'Percentage' : 'Amount',
                      hintText: _discountType == 'percentage' ? '10' : '5.00',
                      border: const OutlineInputBorder(),
                      prefixText: _discountType == 'percentage' ? null : '\$',
                      suffixText: _discountType == 'percentage' ? '%' : null,
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Bundle Summary
            if (_bundleItems.isNotEmpty) ...[
              const Text(
                'Bundle Summary',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              const SizedBox(height: 16),
              
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Items:'),
                          Text('${_bundleItems.length}'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Original Price:'),
                          Text('\$${_bundleItems.fold(0.0, (sum, item) => sum + item.totalPrice).toStringAsFixed(2)}'),
                        ],
                      ),
                      const Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Bundle Price:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            '\$${_calculateBundlePrice().toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: Color(0xFF38E07B),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  double _calculateBundlePrice() {
    final totalPrice = _bundleItems.fold(0.0, (sum, item) => sum + item.totalPrice);
    final discountValue = double.tryParse(_discountController.text) ?? 0.0;
    
    if (_discountType == 'percentage') {
      return totalPrice * (1 - discountValue / 100);
    } else {
      return (totalPrice - discountValue).clamp(0.0, double.infinity);
    }
  }
}

