import 'package:flutter/material.dart';
class RuleEditorScreen extends StatelessWidget {
  final String? ruleId;
  const RuleEditorScreen({super.key, this.ruleId});
  @override Widget build(BuildContext context) => Scaffold(body: Center(child: Text(ruleId == null ? 'New Rule' : 'Edit Rule: \')));
}
