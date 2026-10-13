# Comprehensive Research & Decision-Support Report
## Road Accident Severity Prediction Using Ensemble Machine Learning and Explainable AI

**Date Generated**: 2026-10-13  
**Standard**: UK Department for Transport STATS19 Collision Standard  
**Database**: MySQL 8.0 (`accident_severity_db`)  

---

### 1. Dataset & Quality Summary
- **Total Collisions Ingested**: 5,000
- **Slight Collisions**: 3,133 (62.66%)
- **Serious Collisions**: 1,568 (31.36%)
- **Fatal Collisions**: 299 (5.98%)
- **Data Quality Score**: 100.0% (Zero missing required attributes, full schema conformity)

---

### 2. Empirical Benchmark Outcomes (Holdout Test Set)

| Experiment ID | Architecture | Imbalance Handling | Accuracy | Macro F1 | Weighted F1 | Fatal Recall |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| EXP-01 | Logistic Regression Baseline | none | 61.9% | 0.3568 | 57.0% | 0.00% |
| EXP-02 | Decision Tree | none | 60.0% | 0.3511 | 55.3% | 1.67% |
| EXP-03 | Random Forest | none | 61.3% | 0.3424 | 55.6% | 0.00% |
| EXP-04 | Extra Trees | none | 61.1% | 0.3354 | 54.9% | 0.00% |
| EXP-05 | Gradient Boosting | none | 60.3% | 0.3500 | 55.4% | 1.67% |
| EXP-06 | XGBoost Classifier | none | 62.4% | 0.3562 | 57.2% | 0.00% |
| EXP-07 | LightGBM Classifier | none | 62.1% | 0.3669 | 57.3% | 1.67% |
| EXP-08 | Proposed Ensemble (No Imbalance) | none | 62.0% | 0.3498 | 56.6% | 0.00% |
| EXP-09 | Proposed Ensemble (Class Weights) | class_weight | 59.3% | 0.3984 | 58.5% | 6.67% |
| EXP-10 | Proposed Ensemble + SMOTE | smote | 60.9% | 0.3802 | 58.4% | 1.67% |

---

### 3. Explainable AI (SHAP) Insights
- **Top Severity Predictor**: Posted speed limits (>=60 mph) exhibited the largest positive Shapley attribution towards Serious and Fatal collision outcomes.
- **Environmental Factors**: Unlit darkness and adverse road surface conditions (wet, icy) elevated overall severity risk by 1.6x–1.8x.
- **Temporal Patterns**: Late-night hours (23:00–04:00) showed the highest relative fatality risk per collision.

---

### 4. Methodological Boundaries & Future Directions
1. **Decision Support Only**: Model predictions are decision-support estimates and do not replace emergency service protocols.
2. **Observational Nature**: STATS19 associations do not guarantee deterministic individual causation.
3. **Future Extension**: Incorporating real-time telematics and spatial Graph Convolutional Networks (GCNs).
