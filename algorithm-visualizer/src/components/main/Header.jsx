import { NavLink } from 'react-router-dom';
import { Routes as routes } from '../../enums/routes';

export function Header() {

    return (
        <div className="header d-flex align-items-center px-3">
            <div className="d-flex justify-content-start align-middle nav">
                <NavLink to={routes.PathFinding}>Path Finding</NavLink>
                <NavLink to={routes.EightQueens}>Eight Queens</NavLink>
                <NavLink to={routes.TowerOfHanoi}>Tower Of Hanoi</NavLink>
                <NavLink to={routes.Sorting}>Sorting Algorithms</NavLink>
            </div>
        </div>
    );
}