import ITEquipmentUtills from "./utills";
import { useEffect, useState } from "react";
import { IFormData } from "../interface";
import { IITEquipment, IITEquipmentForm } from "./interface";
import BranchUtills from "../../settings/branch/utills";
import StatusUtills from "../../settings/statuses/Utills";
import UserUtils from "../../users/utils";
import SupplierUtills from "../../settings/suppliers/Utills";
import AssetTypeUtills from "../../settings/assetTypes/utills";
import CommodityUtills from "../../settings/commodity/utills";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import InventoryUtills from "../../inventory/Utills";
import SteppedITEquipmentForm from "./SteppedITEquipmentForm";

const ITEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    option,
    handleChange,
    lpoParams,
    userParams,
    supplierParams,
    branchParams,
    trigger
}: IITEquipmentForm) => {
    const { formFields, categories, computerFields, determineITAssetType } = ITEquipmentUtills();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);

    const [assetTypeId, setAssetTypeId] = useState<number | null>();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const { fetchAllBranches } = BranchUtills();
    const { fetchAllStatuses } = StatusUtills();
    const { fetchAllUsers } = UserUtils();
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { fetchAllSuppliers } = SupplierUtills();
    // const { fetchAllCommodities } = CommodityUtills();
    const { fetchInventory } = InventoryUtills();

    useEffect(() => { fetchAllBranches(branchParams) }, [branchParams]);
    useEffect(() => { fetchAllStatuses() }, []);
    useEffect(() => { fetchAllUsers(userParams) }, [userParams]);
    useEffect(() => { fetchAllSuppliers(supplierParams) }, [supplierParams]);
    useEffect(() => { fetchAllAssetTypes() }, []);
    useEffect(() => { fetchInventory(lpoParams) }, [lpoParams]);

    useEffect(() => {
        if (assetTypes.length > 0) {
            const assetType = determineITAssetType();
            if (assetType !== null) {
                setAssetTypeId(assetType.id as number)
            }
        }
    }, [assetTypes, determineITAssetType]);

    // useEffect(() => {
    //     if (assetTypeId) {
    //         fetchAllCommodities({ assetTypeId })
    //     }
    // }, [assetTypeId, fetchAllCommodities]);

    // Initialize state form fields
    const [stateFormFields, setStateFormFields] = useState<Array<IFormData<IITEquipment>>>([]);

    useEffect(() => {
        // Initialize with basic form fields, skipping the category field (which is at index 0)
        if (formFields && formFields.length > 0) {
            setStateFormFields(formFields.slice(1));
        }
    }, [formFields]);

    const determineCommodityName = (id: number): string => {
        return commodities.find(commodity => commodity.id === id)?.name.split(" ").join("").toLocaleLowerCase() as string;
    }

    useEffect(() => {

        if (option && commodities.length > 0) {
            try {
                const val = parseInt(option);
                setSelectedCategory(val.toLocaleString());

                const commodityName = determineCommodityName(val);
                console.log("Commodity name:", commodityName);

                if (categories && [
                    categories.laptop?.toLowerCase(),
                    categories.desktopComputer?.toLowerCase()
                ].includes(commodityName)) {
                    console.log("Setting computer fields");
                    setStateFormFields([...formFields.slice(1), ...computerFields]);
                } else {
                    console.log("Setting standard fields");
                    setStateFormFields([...formFields.slice(1)]);
                }
            } catch (err) {
                console.error("Error processing option:", err);
            } finally {
                // Always turn off loading
                setLoading(false);
            }
        } else if (formFields && formFields.length > 0) {
            // Default behavior if no option is selected
            console.log("Setting default fields");
            setStateFormFields(formFields.slice(1));
            setLoading(false);
        }
    }, [option, commodities, categories, formFields, computerFields]);

    // Display the stepped form component with our fields
    return (
        <SteppedITEquipmentForm
            formState={formState}
            control={control}
            register={register}
            buttonText={buttonText}
            sendingRequest={sendingRequest}
            option={option}
            handleChange={handleChange}
            formFields={formFields}
            computerFields={computerFields}
            categories={categories}
            selectedCategory={selectedCategory}
            stateFormFields={stateFormFields}
            isUpdate={!!lpoParams}
            loading={loading}
            trigger={trigger}
        />
    );
};

export default ITEquipmentForm;