import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { AccidentRecordsPage } from './pages/AccidentRecordsPage';
import { EdaPage } from './pages/EdaPage';
import { ModelTrainingPage } from './pages/ModelTrainingPage';
import { ModelEvaluationPage } from './pages/ModelEvaluationPage';
import { SeverityPredictionPage } from './pages/SeverityPredictionPage';
import { ExplainableAiPage } from './pages/ExplainableAiPage';
import { GeographicAnalyticsPage } from './pages/GeographicAnalyticsPage';
import { RoadSafetyInsightsPage } from './pages/RoadSafetyInsightsPage';
import { ResearchExperimentsPage } from './pages/ResearchExperimentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/accidents" element={<AccidentRecordsPage />} />
          <Route path="/eda" element={<EdaPage />} />
          <Route path="/training" element={<ModelTrainingPage />} />
          <Route path="/evaluation" element={<ModelEvaluationPage />} />
          <Route path="/prediction" element={<SeverityPredictionPage />} />
          <Route path="/explainability" element={<ExplainableAiPage />} />
          <Route path="/geographic" element={<GeographicAnalyticsPage />} />
          <Route path="/insights" element={<RoadSafetyInsightsPage />} />
          <Route path="/experiments" element={<ResearchExperimentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
