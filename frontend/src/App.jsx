import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Background } from './pages/Background';
import { FileInput } from './components/FileInput';
import { ScoreVisualizationPage } from './pages/ScoreVisualizationPage ';

function App() {
  return (
    <BrowserRouter>
      <Background>
        <Routes>
          <Route path="/" element={<FileInput />} />
          <Route path="/score-visualization" element={<ScoreVisualizationPage />} />
        </Routes>
      </Background>
    </BrowserRouter>
  );
}

export default App;
