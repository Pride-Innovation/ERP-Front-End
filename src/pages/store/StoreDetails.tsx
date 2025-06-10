import { useContext, useEffect } from "react";
import { StoreContext } from "../../context/store";

const StoreDetails = () => {
    const { curentStoreData } = useContext(StoreContext);


    useEffect(() => { console.log(curentStoreData, "curentStoreData") }, [curentStoreData])
    return (
        <div>{curentStoreData?.commodity?.name && curentStoreData?.commodity?.name}</div>
    )
}

export default StoreDetails