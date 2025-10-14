import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        actions: [
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              return CircleAvatar(
                radius: 16,
                backgroundColor: Colors.grey[300],
                child: Text(
                  authProvider.shopDomain?.substring(0, 1).toUpperCase() ?? 'S',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Account Section
            const Text(
              'Account',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: 16),
            
            Card(
              child: ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF38E07B).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.person,
                    color: Color(0xFF38E07B),
                  ),
                ),
                title: const Text('Manage Account'),
                subtitle: const Text('View and edit your personal details'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Implement account management
                },
              ),
            ),
            
            const SizedBox(height: 24),
            
            // App Preferences Section
            const Text(
              'App Preferences',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: 16),
            
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF38E07B).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.tune,
                        color: Color(0xFF38E07B),
                      ),
                    ),
                    title: const Text('Preferences'),
                    subtitle: const Text('Customize your app experience'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // TODO: Implement preferences
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF38E07B).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.notifications,
                        color: Color(0xFF38E07B),
                      ),
                    ),
                    title: const Text('Notifications'),
                    subtitle: const Text('Choose what updates you receive'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // TODO: Implement notifications settings
                    },
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Help & Support Section
            const Text(
              'Help & Support',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: 16),
            
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF38E07B).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.help_center,
                        color: Color(0xFF38E07B),
                      ),
                    ),
                    title: const Text('Help Center'),
                    subtitle: const Text('Find answers and tutorials'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // TODO: Implement help center
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF38E07B).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.support_agent,
                        color: Color(0xFF38E07B),
                      ),
                    ),
                    title: const Text('Contact Support'),
                    subtitle: const Text('Get in touch with our team'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // TODO: Implement contact support
                    },
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Shop Information
            Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Connected Shop',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(
                              Icons.store,
                              color: Color(0xFF38E07B),
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              authProvider.shopDomain ?? 'Not connected',
                              style: const TextStyle(fontSize: 14),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 32),
            
            // Log Out Button
            Center(
              child: ElevatedButton(
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Log Out'),
                      content: const Text('Are you sure you want to log out?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(false),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(true),
                          style: TextButton.styleFrom(foregroundColor: Colors.red),
                          child: const Text('Log Out'),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true) {
                    final authProvider = Provider.of<AuthProvider>(context, listen: false);
                    await authProvider.logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.withOpacity(0.1),
                  foregroundColor: Colors.red,
                  side: BorderSide(color: Colors.red.withOpacity(0.3)),
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                ),
                child: const Text(
                  'Log Out',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Footer
            const Center(
              child: Text(
                '© 2024 Dragon Bundle. All rights reserved.',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF38E07B),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2),
            label: 'Products',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.widgets),
            label: 'Bundles',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
        onTap: (index) {
          switch (index) {
            case 0:
              context.push('/products');
              break;
            case 1:
              context.push('/my-bundles');
              break;
            case 2:
              // Already on settings screen
              break;
          }
        },
      ),
    );
  }
}

