import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChessBoard, HanoiTower, Header, MazeMatrix, SortingAlgorithms } from './components';
import { Routes as routes } from './enums/routes';

function App() {
  return (
      <Router>
        <Header />
        <Routes>
          <Route path="/" exact element={<MazeMatrix />} />
          <Route path={routes.PathFinding} element={<MazeMatrix />} />
          <Route path={routes.EightQueens} element={<ChessBoard />} />
          <Route path={routes.TowerOfHanoi} element={<HanoiTower />} />
          <Route path={routes.Sorting} element={<SortingAlgorithms />} />
        </Routes>
      </Router>
  );
}

export default App;
