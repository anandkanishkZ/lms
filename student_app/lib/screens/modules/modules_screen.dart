import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/module_provider.dart';
import '../../models/module.dart';
import 'module_detail_screen.dart';
import 'module_detail_screen.dart';

class ModulesScreen extends StatefulWidget {
  const ModulesScreen({super.key});

  @override
  State<ModulesScreen> createState() => _ModulesScreenState();
}

class _ModulesScreenState extends State<ModulesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<ModuleProvider>(context, listen: false);
      provider.loadEnrolledModules();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Modules'),
      ),
      body: _MyModulesTab(),
    );
  }
}

class _MyModulesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ModuleProvider>(context);

    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.enrolledModules.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.book, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No enrolled modules',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Enroll in modules to see them here',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadEnrolledModules(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: provider.enrolledModules.length,
        itemBuilder: (context, index) {
          final module = provider.enrolledModules[index];
          return _ModuleCard(
            module: module,
            showProgress: true,
          );
        },
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final Module module;
  final bool showProgress;

  const _ModuleCard({
    required this.module,
    this.showProgress = true,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ModuleDetailScreen(module: module),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                module.title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              if (module.description != null && module.description!.isNotEmpty)
                Text(
                  module.description!,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.play_circle_outline, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    'Module',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    'Self-paced',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              if (showProgress && module.progress != null) ...[
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: module.progress! / 100,
                  backgroundColor: Colors.grey[200],
                ),
                const SizedBox(height: 4),
                Text(
                  '${module.progress}% complete',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
