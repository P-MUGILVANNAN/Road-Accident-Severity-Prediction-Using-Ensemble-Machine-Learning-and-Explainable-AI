# Road Accident Severity Prediction Using Ensemble Machine Learning and Explainable AI

## Executive Summary
We have developed and verified a complete, end-to-end research and decision-support application: **"Road Accident Severity Prediction Using Ensemble Machine Learning and Explainable AI"**. The system analyzes historical road collision records conforming to the **UK Department for Transport (DfT) STATS19** collision standard, predicts collision severity across multiclass categories (**Slight**, **Serious**, **Fatal**), resolves acute class imbalance, and provides game-theoretic interpretability via **Tree SHAP**.

---

## 1. Verified Architecture & Module Mapping

```mermaid
graph TD
    A[UK DfT STATS19 Collision Registry] --> B[Data Ingestion & Schema Validation Engine]
    B --> C[Feature Engineering & Leakage Isolation]
    C --> D[Stratified 80/20 Train-Test Holdout Split]
    
    subgraph "Machine Learning Benchmark Pipeline"
        D --> M1[Logistic Regression Baseline]
        D --> M2[Decision Tree Classifier]
        D --> M3[Random Forest & Extra Trees]
        D --> M4[XGBoost & LightGBM]
        D --> M5[Proposed Soft-Voting Ensemble]
    end
    
    M5 --> EVAL[Multiclass Diagnostic Evaluator]
    M5 --> XAI[Tree SHAP Explainability Engine]
    
    EVAL --> API[FastAPI High-Performance REST API]
    XAI --> API
    
    API --> DB[(SQLite / PostgreSQL DB)]
    API --> UI[React 19 + TypeScript + Vite Dashboard]
```

### Complete Implementation Across All 19 Modules:
1. **Dashboard Overview**: KPI cards, historical distributions, road type, weather, lighting, day of week trends, and best model summary card.
2. **Accident Data Management**: Searchable tabular data, pagination, sorting, CSV export, and schema-validating CSV upload.
3. **Exploratory Data Analysis (EDA)**: Cross-tabulations, severity vs lighting, speed limit, road layout, and 24-hour diurnal patterns.
4. **Feature Engineering**: Rush-hour indicators, day-of-week, weather-surface compound risk, with zero post-crash target leakage.
5. **Machine Learning Model Training**: Logistic Regression, Decision Tree, Random Forest, Extra Trees, Gradient Boosting, XGBoost, LightGBM, and Soft-Voting Ensemble with background task execution.
6. **Model Evaluation Diagnostics**: Confusion matrices, macro/weighted F1, One-vs-Rest ROC-AUC, per-class sensitivity on minority fatal accidents.
7. **Severity Prediction Engine**: Interactive single collision form, calibrated class probability spectrums, local Tree SHAP attributions, and batch CSV predictions.
8. **Explainable AI (SHAP)**: Global feature importance, per-class SHAP attributions, polynomial time Tree SHAP formulation, and interpretability limitations discussion.
9. **Geographic Accident Analytics**: OpenStreetMap Leaflet integration with color-coded markers (Slight=green, Serious=amber, Fatal=red), hotspot density rankings, and regional breakdowns.
10. **Road Safety Risk Analytics**: Observed relative risk ratios, confidence boundaries, and evidence-based countermeasures.
11. **Research Experiment Manager**: Systematic evaluation of 4 core Research Questions (RQ1–RQ4) and 10 controlled experiments.
12. **Reports & Exports**: Print-ready technical research summaries and CSV benchmark exports.
13. **User Interface & Design**: Navy sidebar (`#0B1528`), clean cards, responsive desktop/tablet layouts, and accessible contrast.
14. **Backend API**: Modular FastAPI architecture with Pydantic v2 schemas and Swagger documentation.
15. **Database Design**: SQLAlchemy ORM models with indexing on severity, date, and spatial coordinates.
16. **Project Structure**: Clean decoupling between `frontend/`, `backend/`, `data/`, `models/`, `reports/`, and `research/`.
17. **Automated Testing**: 8 passing Pytest tests covering schemas, leakage prevention, probability calibration, and API endpoints.
18. **IEEE-Style Research Paper**: Publication-ready manuscript located in [research/ieee_research_paper.md](file:///d:/PROJECTS/Road%20Accident%20Severity%20Prediction%20Using%20Ensemble%20Machine%20Learning%20and%20Explainable%20AI/research/ieee_research_paper.md).
19. **Phased Delivery**: Full verification with live backend daemon and browser subagent end-to-end execution.

---

## 2. Empirical Benchmark Evaluation

All models were evaluated on the untouched 20% holdout test partition ($N=1,000$ collisions):

| Exp ID | Architecture | Imbalance Handling | Accuracy | Macro F1 | Weighted F1 | Fatal Recall | Research Significance |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **EXP-01** | Logistic Regression | None | 61.9% | 0.3568 | 0.5054 | 0.00% | Linear baseline collapse on minority fatal class |
| **EXP-02** | Decision Tree | None | 60.0% | 0.3511 | 0.5098 | 1.67% | High variance single tree |
| **EXP-03** | Random Forest | None | 61.3% | 0.3424 | 0.4998 | 0.00% | Bagging struggles with unweighted imbalance |
| **EXP-04** | Extra Trees | None | 61.1% | 0.3354 | 0.4913 | 0.00% | High randomness majority-class dominance |
| **EXP-05** | Gradient Boosting | None | 60.3% | 0.3500 | 0.5073 | 1.67% | Sequential boosting |
| **EXP-06** | XGBoost Classifier | None | 62.4% | 0.3562 | 0.5126 | 0.00% | Strong accuracy, zero minority recall |
| **EXP-07** | LightGBM Classifier | None | 62.1% | 0.3669 | 0.5222 | 1.67% | Leaf-wise tree growth |
| **EXP-08** | Soft-Voting Ensemble | None | 62.0% | 0.3498 | 0.5061 | 0.00% | Unweighted ensemble |
| **EXP-09** | **Soft-Voting Ensemble** | **Class Weights** | **59.3%** | **0.3984** | **0.5510** | **6.67%** | **Highest Macro F1 & 4x lift in Fatal Recall** |
| **EXP-10** | Soft-Voting Ensemble | SMOTE | 60.9% | 0.3802 | 0.5367 | 1.67% | Resampling within training folds |

> [!IMPORTANT]
> **Key Data Science Finding (Addressing RQ2)**: Unweighted baseline models achieve superficial accuracy (~62%) by completely ignoring the minority Fatal class (0.00% recall). Introducing cost-sensitive class weights in the proposed Soft-Voting Ensemble (EXP-09) trades minor majority-class accuracy to achieve the highest balanced Macro F1 (0.3984) and raises Fatal collision recall by over 4-fold to 6.67%.

---

## 3. Visual System Verification Gallery

````carousel
![Dashboard Overview](/C:/Users/mugil/.gemini/antigravity-ide/brain/3ed05dfd-70d6-4d69-b460-094e2892096a/dashboard_overview_1791881418283.png)
<!-- slide -->
![Accident Records Database](/C:/Users/mugil/.gemini/antigravity-ide/brain/3ed05dfd-70d6-4d69-b460-094e2892096a/accident_records_1791881435955.png)
<!-- slide -->
![Severity Prediction & Local SHAP](/C:/Users/mugil/.gemini/antigravity-ide/brain/3ed05dfd-70d6-4d69-b460-094e2892096a/prediction_results_1791881478832.png)
<!-- slide -->
![Explainable AI (SHAP Global Feature Attribution)](/C:/Users/mugil/.gemini/antigravity-ide/brain/3ed05dfd-70d6-4d69-b460-094e2892096a/explainable_ai_1791881502938.png)
<!-- slide -->
![Interactive Geographic Collision Map](/C:/Users/mugil/.gemini/antigravity-ide/brain/3ed05dfd-70d6-4d69-b460-094e2892096a/geographic_map_1791881521537.png)
````

---

## 4. How to Run the Platform

### Running Locally
```bash
# 1. Start the FastAPI ML Backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# 2. Start the React 19 Frontend
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://localhost:5173`
- Swagger REST Documentation: `http://localhost:8000/docs`

### Running via Docker Compose
```bash
docker-compose up --build
```
