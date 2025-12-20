import 'package:flutter/material.dart';

class SkeletonBox extends StatelessWidget {
  final double? height;
  final double? width;
  final BorderRadius? borderRadius;
  final EdgeInsets? margin;

  const SkeletonBox({
    super.key,
    this.height,
    this.width,
    this.borderRadius,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      margin: margin,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: borderRadius ?? BorderRadius.circular(8),
      ),
    );
  }
}

// Skeleton Card Widget for Dashboard Stats
class SkeletonStatCards extends StatelessWidget {
  const SkeletonStatCards({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        children: [
          Expanded(
            child: _SkeletonStatCard(),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _SkeletonStatCard(),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _SkeletonStatCard(),
          ),
        ],
      ),
    );
  }
}

class _SkeletonStatCard extends StatelessWidget {
  const _SkeletonStatCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SkeletonBox(
            height: 32,
            width: 32,
            borderRadius: BorderRadius.circular(8),
          ),
          const SizedBox(height: 12),
          SkeletonBox(
            height: 24,
            width: 50,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 8),
          SkeletonBox(
            height: 14,
            width: 70,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }
}

// Skeleton for Module Cards (Grid View)
class SkeletonModuleGrid extends StatelessWidget {
  const SkeletonModuleGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.85,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: 6,
      itemBuilder: (context, index) => _SkeletonModuleCard(),
    );
  }
}

class _SkeletonModuleCard extends StatelessWidget {
  const _SkeletonModuleCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonBox(
            height: 120,
            width: double.infinity,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(12),
              topRight: Radius.circular(12),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonBox(
                  height: 16,
                  width: double.infinity,
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 8),
                SkeletonBox(
                  height: 12,
                  width: 100,
                  borderRadius: BorderRadius.circular(4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Skeleton for Exam Cards (List View)
class SkeletonExamList extends StatelessWidget {
  const SkeletonExamList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) => _SkeletonExamCard(),
    );
  }
}

class _SkeletonExamCard extends StatelessWidget {
  const _SkeletonExamCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                SkeletonBox(
                  height: 40,
                  width: 40,
                  borderRadius: BorderRadius.circular(8),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SkeletonBox(
                        height: 16,
                        width: double.infinity,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      const SizedBox(height: 8),
                      SkeletonBox(
                        height: 12,
                        width: 150,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: SkeletonBox(
                    height: 12,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SkeletonBox(
                    height: 12,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Skeleton for Live Classes
class SkeletonLiveClassList extends StatelessWidget {
  const SkeletonLiveClassList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (context, index) => _SkeletonLiveClassCard(),
    );
  }
}

class _SkeletonLiveClassCard extends StatelessWidget {
  const _SkeletonLiveClassCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonBox(
            height: 180,
            width: double.infinity,
            borderRadius: BorderRadius.zero,
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonBox(
                  height: 18,
                  width: double.infinity,
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 8),
                SkeletonBox(
                  height: 14,
                  width: 200,
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    SkeletonBox(
                      height: 12,
                      width: 100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    const SizedBox(width: 16),
                    SkeletonBox(
                      height: 12,
                      width: 80,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Skeleton for Notice List
class SkeletonNoticeList extends StatelessWidget {
  const SkeletonNoticeList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 6,
      itemBuilder: (context, index) => _SkeletonNoticeCard(),
    );
  }
}

class _SkeletonNoticeCard extends StatelessWidget {
  const _SkeletonNoticeCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                SkeletonBox(
                  height: 10,
                  width: 80,
                  borderRadius: BorderRadius.circular(4),
                ),
                const Spacer(),
                SkeletonBox(
                  height: 10,
                  width: 60,
                  borderRadius: BorderRadius.circular(4),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SkeletonBox(
              height: 16,
              width: double.infinity,
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 8),
            SkeletonBox(
              height: 14,
              width: 250,
              borderRadius: BorderRadius.circular(4),
            ),
          ],
        ),
      ),
    );
  }
}

// Skeleton for Module Detail Tabs (Resources, Topics, etc.)
class SkeletonListItems extends StatelessWidget {
  final int itemCount;
  const SkeletonListItems({super.key, this.itemCount = 5});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: itemCount,
      itemBuilder: (context, index) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              SkeletonBox(
                height: 48,
                width: 48,
                borderRadius: BorderRadius.circular(8),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonBox(
                      height: 16,
                      width: double.infinity,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    const SizedBox(height: 8),
                    SkeletonBox(
                      height: 12,
                      width: 150,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Skeleton for Exam/Lesson Detail Content
class SkeletonDetailContent extends StatelessWidget {
  const SkeletonDetailContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonBox(
            height: 24,
            width: double.infinity,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 16),
          SkeletonBox(
            height: 16,
            width: double.infinity,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 8),
          SkeletonBox(
            height: 16,
            width: double.infinity,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 8),
          SkeletonBox(
            height: 16,
            width: 250,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 24),
          SkeletonBox(
            height: 200,
            width: double.infinity,
            borderRadius: BorderRadius.circular(8),
          ),
          const SizedBox(height: 16),
          SkeletonBox(
            height: 16,
            width: double.infinity,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 8),
          SkeletonBox(
            height: 16,
            width: double.infinity,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }
}
