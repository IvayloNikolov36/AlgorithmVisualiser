export default function HanoiTower() {

    return (
        <div className="container">
            <div className="pegsContainer">
                <div className="pegCol">
                    <div className="disksCol">
                        <div className="disk megaSmallDisk"></div>
                        <div className="disk extraSmallDisk"></div>
                        <div className="disk smallDisk"></div>
                        <div className="disk mediumDisk"></div>
                        <div className="disk largeDisk"></div>
                        <div className="disk extraLargeDisk"></div>
                    </div>
                    <div className="peg"></div>
                </div>
                <div className="pegCol">
                    <div className="disksCol">
                    </div>
                    <div className="peg"></div>
                </div>
                <div className="pegCol">
                    <div className="disksCol">
                    </div>
                    <div className="peg"></div>
                </div>
            </div>
            <div className="pegsFundament"></div>
            <div className="pegsSymbols">
                <div className="col">
                    <h1>S</h1>
                </div>
                <div className="col">
                    <h1>A</h1>
                </div>
                <div className="col">
                    <h1>D</h1>
                </div>
            </div>
        </div>
    );
} 