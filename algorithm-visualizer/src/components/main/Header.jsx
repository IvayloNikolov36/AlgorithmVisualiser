import { NavLink } from 'react-router-dom';
import { Routes as routes } from '../../enums/routes';


export function Header() {

    return (
        <div className="header d-flex align-items-center px-3">
            <div className="d-flex justify-content-start align-middle nav">
                <NavLink to={routes.Dijkstras}>Dijkstra's</NavLink>
                <NavLink to={routes.Prims}>Prim's</NavLink>
                <NavLink to={routes.Sorting}>Sorting</NavLink>
                <NavLink to={routes.EightQueens}>Eight Queens</NavLink>
                <NavLink to={routes.KnightsTour}>Knight's Tour</NavLink>
                <NavLink to={routes.PathFinding}>Labyrinth Path</NavLink>
                <NavLink to={routes.TowerOfHanoi}>Hanoi's Tower</NavLink>
            </div>
        </div>
    );
}