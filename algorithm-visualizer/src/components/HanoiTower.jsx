import { cloneDeep } from "lodash";
import { useState } from "react";
import { DiskEnum } from "../enums/disk.enum";
import { setTimeOutAfter } from "../helpers/thread-sleep";
import { ButtonGroup, Button } from "react-bootstrap";

const WaitInSeconds = 0.6;

export function HanoiTower() {

    const [sourcePegDisks, setSourcePegDisks] = useState([]);
    const [auxPegDisks, setAuxPegDisks] = useState([]);
    const [destinationPegDisks, setDestinationPegDisks] = useState([]);

    const [isStartDisabled, setIsStartDisabled] = useState(false);
    const [isResetDisabled, setIsResetDisabled] = useState(true);

    const DisksAmount = 3;
    const Disks = Array.from({ length: DisksAmount }, (_, index) => ++index);

    useState(() => {
        setSourcePegDisks(Disks);
    }, []);

    const reset = () => {
        setSourcePegDisks(Disks);
        setAuxPegDisks([]);
        setDestinationPegDisks([]);
        setIsStartDisabled(false);
    }

    const onStartMoving = async () => {
        setIsStartDisabled(true);
        setIsResetDisabled(true);
        const bottomDisk = sourcePegDisks[sourcePegDisks.length - 1];
        await moveDisks(bottomDisk, sourcePegDisks, destinationPegDisks, auxPegDisks);
        setIsResetDisabled(false);
    }

    const moveDisks = async (bottomDisk, source, destination, aux) => {
        if (bottomDisk === 1) {
            const index = source.indexOf(bottomDisk);
            source.splice(index, 1);
            await refreshPegs();

            destination.unshift(bottomDisk);
            await refreshPegs();
        } else {
            let disk = bottomDisk - 1;
            await moveDisks(disk, source, aux, destination);

            const index = source.indexOf(bottomDisk);
            console.log(source.length);
            const removed = source.splice(index, 1);
            await refreshPegs();

            destination.unshift(removed[0]);
            await refreshPegs();

            disk = aux[aux.length - 1];
            await moveDisks(disk, aux, destination, source);
        }
    }

    const refreshPegs = async () => {
        setSourcePegDisks(cloneDeep(sourcePegDisks));
        setAuxPegDisks(cloneDeep(auxPegDisks));
        setDestinationPegDisks(cloneDeep(destinationPegDisks));
        await setTimeOutAfter(WaitInSeconds);
    }

    const getDiskClass = (diskValue) => {
        return DiskEnum[diskValue];
    }

    const getPegWithDisks = (pegDisks) => {
        return <div className="d-flex flex-column justify-content-end align-items-center position-relative"
        >
            <div className="d-flex flex-column align-items-center position-absolute">
                {
                    pegDisks.map((diskValue, index) => {
                        return <div
                            className={`disk ${getDiskClass(diskValue)}`}
                            key={`${diskValue}-${index}`}
                        >
                        </div>
                    })
                }
            </div>
            <div className="peg">
            </div>
        </div>
    }

    return (
        <div className="container-fluid px-5 py-4">
            <div className="d-flex justify-content-center mb-5">
                <ButtonGroup>
                    <Button
                        onClick={onStartMoving}
                        disabled={isStartDisabled}
                        variant="outline-primary"
                    >Move disks to Peg 'D'
                    </Button>
                    <Button
                        onClick={reset}
                        disabled={isResetDisabled}
                        variant="outline-primary"
                    >Reset
                    </Button>
                </ButtonGroup>
            </div>
            <div className="d-flex justify-content-around pegsContainer">
                {getPegWithDisks(sourcePegDisks)}
                {getPegWithDisks(auxPegDisks)}
                {getPegWithDisks(destinationPegDisks)}
            </div>
            <div className="pegsFundament"></div>
            <div className="d-flex flex-row justify-content-around">
                <span className="fs-1 fw-bold">S</span>
                <span className="fs-1 fw-bold">A</span>
                <span className="fs-1 fw-bold">D</span>
            </div>
        </div>
    );
} 