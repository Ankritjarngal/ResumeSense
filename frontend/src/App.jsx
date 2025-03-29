import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Background } from './pages/Background';
import { FileInput } from './components/FileInput';
import { ScoreVisualizationPage } from './pages/ScoreVisualizationPage ';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Background>
        <Routes>
          <Route path="/" element={<FileInput />} />
          <Route path="/score-visualization" element={<ScoreVisualizationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Background>
    </BrowserRouter>
  );
}

export default App;
