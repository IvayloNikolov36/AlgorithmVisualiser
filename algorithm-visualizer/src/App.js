import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  EightQueens,
  HanoiTower,
  Header,
  KnightsTour,
  MazeMatrix,
  Prims,
  SortingAlgorithms
}
  from './components';
import { Routes as routes } from './enums/routes';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" exact element={<MazeMatrix />} />
        <Route path={routes.PathFinding} element={<MazeMatrix />} />
        <Route path={routes.EightQueens} element={<EightQueens />} />
        <Route path={routes.TowerOfHanoi} element={<HanoiTower />} />
        <Route path={routes.Sorting} element={<SortingAlgorithms />} />
        <Route path={routes.KnightsTour} element={<KnightsTour />} />
        <Route path={routes.Prims} element={<Prims />} />
      </Routes>
    </Router>
  );
}

export default App;
