import { getCardStructure } from "../../functions/sorting-algorithms-functions";

export function AuxCardsContainer({ cardElements }) {

    return (
        <div className="d-flex justify-content-around mx-3 my-1 pt-1">
            {
                cardElements.map((card, index) => {
                    return <div className="d-flex-col">
                        {getCardStructure(card, index, false)}
                    </div>
                })
            }
        </div>
    )
}