import '../App.css';

export default function MazeMatrix() {

    const emptyCell = 'empty';
    const wallCell = 'wall';

    const matrix = [
        ['start', wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell],
        [emptyCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell],
        [wallCell, emptyCell, wallCell, wallCell, wallCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, wallCell],
        [wallCell, emptyCell, wallCell, wallCell, emptyCell, emptyCell, wallCell, wallCell, wallCell, emptyCell, emptyCell],
        [wallCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, emptyCell, wallCell, emptyCell],
        [wallCell, emptyCell, wallCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, emptyCell, emptyCell, emptyCell],
        [wallCell, emptyCell, wallCell, emptyCell, wallCell, emptyCell, emptyCell, emptyCell, emptyCell, wallCell, emptyCell],
        [wallCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, emptyCell],
        [wallCell, wallCell, wallCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, emptyCell],
        [wallCell, wallCell, wallCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, 'end']
    ];

    return (
        <div className="container">
            {
                matrix.map((row) => {
                    return <div className="row">
                        {
                            row.map((cell) => {
                                return <div className={`maze-cell ${cell}`}>
                                </div>
                            })
                        }
                    </div>
                })
            }
        </div>
    );
}