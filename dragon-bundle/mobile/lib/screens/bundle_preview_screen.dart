import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/bundle_provider.dart';
import '../models/bundle.dart';

class BundlePreviewScreen extends StatefulWidget {
  final int bundleId;

  const BundlePreviewScreen({
    super.key,
    required this.bundleId,
  });

  @override
  State<BundlePreviewScreen> createState() => _BundlePreviewScreenState();
}

class _BundlePreviewScreenState extends State<BundlePreviewScreen> {
  bool _isCreatingCheckout = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BundleProvider>().loadBundle(widget.bundleId);
    });
  }

  Future<void> _createCheckout() async {
    setState(() {
      _isCreatingCheckout = true;
    });

    try {
      final bundleProvider = Provider.of<BundleProvider>(context, listen: false);
      final checkoutUrl = await bundleProvider.createCheckout(widget.bundleId);

      if (checkoutUrl != null && mounted) {
        final uri = Uri.parse(checkoutUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          throw Exception('Could not launch checkout URL');
        }
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to create checkout'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCreatingCheckout = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bundle Preview'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share functionality
            },
          ),
        ],
      ),
      body: Consumer<BundleProvider>(
        builder: (context, bundleProvider, _) {
          if (bundleProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF38E07B)),
              ),
            );
          }

          if (bundleProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    bundleProvider.error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => bundleProvider.loadBundle(widget.bundleId),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final bundle = bundleProvider.currentBundle;
          if (bundle == null) {
            return const Center(
              child: Text('Bundle not found'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Bundle Header
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Bundle Image
                        if (bundle.coverImageUrl != null)
                          Container(
                            width: double.infinity,
                            height: 200,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              color: Colors.grey[100],
                            ),
                            child: CachedNetworkImage(
                              imageUrl: bundle.coverImageUrl!,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF38E07B)),
                                ),
                              ),
                              errorWidget: (context, url, error) => const Icon(
                                Icons.widgets,
                                size: 64,
                                color: Color(0xFF38E07B),
                              ),
                            ),
                          ),
                        
                        const SizedBox(height: 16),
                        
                        // Bundle Title
                        Text(
                          bundle.title,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        
                        const SizedBox(height: 8),
                        
                        // Bundle Description
                        if (bundle.description != null)
                          Text(
                            bundle.description!,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 16,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Bundle Items
                const Text(
                  'Bundle Contents',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                
                const SizedBox(height: 16),
                
                ...bundle.items.map((item) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        color: Colors.grey[100],
                      ),
                      child: item.imageUrl != null
                          ? CachedNetworkImage(
                              imageUrl: item.imageUrl!,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF38E07B)),
                                ),
                              ),
                              errorWidget: (context, url, error) => const Icon(
                                Icons.image,
                                color: Color(0xFF38E07B),
                              ),
                            )
                          : const Icon(
                              Icons.image,
                              color: Color(0xFF38E07B),
                            ),
                    ),
                    title: Text(item.title),
                    subtitle: Text(item.variantTitle ?? 'Default'),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Qty: ${item.quantity}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '\$${item.totalPrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Color(0xFF38E07B),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                )),
                
                const SizedBox(height: 24),
                
                // Price Summary
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Items Total:'),
                            Text('\$${bundle.totalPrice.toStringAsFixed(2)}'),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${bundle.discountType == 'percentage' ? 'Discount' : 'Savings'}:',
                              style: const TextStyle(color: Color(0xFF38E07B)),
                            ),
                            Text(
                              bundle.discountType == 'percentage'
                                  ? '${bundle.discountValue}%'
                                  : '\$${bundle.discountValue.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: Color(0xFF38E07B),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const Divider(),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Bundle Price:',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '\$${bundle.discountedPrice.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF38E07B),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF38E07B).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'You save \$${bundle.savings.toStringAsFixed(2)}!',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFF38E07B),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Add to Cart Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isCreatingCheckout ? null : _createCheckout,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF38E07B),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isCreatingCheckout
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text(
                            'Add Bundle to Cart',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

