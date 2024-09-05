import { cloneDeep } from "lodash";
import { useState } from "react";
import { DiskEnum } from "../enums/disk.enum";
import { setTimeOutAfter } from "../helpers/thread-sleep";

const WaitInSeconds = 0.6;

export default function HanoiTower() {

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

    return (
        <div className="container">
            <div className="btnRow">
                <button onClick={onStartMoving} disabled={isStartDisabled} className='primaryButton'>Move Disks To D</button>
                <button onClick={reset} disabled={isResetDisabled} className='primaryButton'>Reset</button>
            </div>
            <div className="pegsContainer">
                <div className="pegCol">
                    <div className="disksCol">
                        {
                            sourcePegDisks.map((diskValue, index) => {
                                return <div className={`disk ${getDiskClass(diskValue)}`} key={`${diskValue}-${index}`}></div>
                            })
                        }
                    </div>
                    <div className="peg"></div>
                </div>
                <div className="pegCol">
                    <div className="disksCol">
                        {
                            auxPegDisks.map((diskValue, index) => {
                                return <div className={`disk ${getDiskClass(diskValue)}`} key={`${diskValue}_${index}`}></div>
                            })
                        }
                    </div>
                    <div className="peg"></div>
                </div>
                <div className="pegCol">
                    <div className="disksCol">
                        {
                            destinationPegDisks.map((diskValue, index) => {
                                return <div className={`disk ${getDiskClass(diskValue)}`} key={`${diskValue}:${index}`}></div>
                            })
                        }
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