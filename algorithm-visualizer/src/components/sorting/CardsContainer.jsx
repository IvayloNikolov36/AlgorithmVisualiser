import { getCardStructure } from "../../functions/sorting-algorithms-functions";

export function CardsContainer({ cardElements }) {

    return (
        <div className="d-flex justify-content-around mx-3 my-1 pt-1">
            {
                cardElements?.map((card, index) => {
                    return <div
                        className="d-flex-col"
                        key={index}
                    >
                        <div className="d-flex align-items-end card-label text-start">
                            <span>{card.label}</span>
                        </div>

                        {getCardStructure(card, index, true)}

                        <div className="d-flex align-items-end text-start mt-3 ms-1">
                            <span className="text-info fs-5">{index}</span>
                        </div>
                    </div>
                })
            }
        </div>
    )
}